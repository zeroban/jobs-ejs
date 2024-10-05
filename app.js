const express = require("express");
const auth = require("./middleware/auth");
const cookieParser = require("cookie-parser");

// Security Packages
const helmet = require('helmet');
const rateLimiter = require('express-rate-limit');
const xss = require('xss-clean');

require("express-async-errors");

const app = express();

// rateLimter section
app.use(
    rateLimiter({
        windowsMs: 15 * 60 * 1000, //15 minutes
        max: 100, //limits each IP to 100 requests per windowsMs
    })
);

// Helmet and xss section
app.use(helmet());
app.use(xss());

// .env update
require("dotenv").config(); // to load the .env file into the process.env object
const session = require("express-session");

// updating mongoDB
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
    // may throw an error, which won't be caught
    uri: url,
    collection: "mySessions",
});
store.on("error", function (error) {
    console.log(error);
});

const sessionParms = {
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
    sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(require("body-parser").urlencoded({ extended: true }));
app.use(session(sessionParms));

/* ------------------ CSRF SETUP BELOW --------------------- */
const csrf = require('host-csrf')

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.urlencoded({ extended: false }));
let csrf_development_mode = true;
if (app.get("env") === "production") {
    csrf_development_mode = false;
    app.set("trust proxy", 1);
}
const csrf_options = {
    protected_operations: ["PATCH"],
    protected_content_types: ["application/json"],
    development_mode: csrf_development_mode,
};
const csrf_middleware = csrf(csrf_options); //initialise and return middlware

/* ------------------ CSRF SETUP ABOVE --------------------- */


// added flash
app.use(require("connect-flash")());

// Passport initialization
/* ------------------ 7.19.2024 --------------------- */
const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());
/* -------------------------------------------------- */

app.use(require("./middleware/storeLocals"));

app.set("view engine", "ejs");

app.get("/", csrf_middleware, (req, res) => {
    res.render("index");
});
app.use("/sessions", csrf_middleware, require("./routes/sessionRoutes"));

// secret word handling
const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, csrf_middleware, secretWordRouter);

// added csrf_middleware
app.get("/secretWord", csrf_middleware, (req, res) => {
    if (!req.session.secretWord) {
        req.session.secretWord = "syzygy";
    }
    res.locals.info = req.flash("info");
    res.locals.errors = req.flash("error");
    res.render("secretWord", { secretWord: req.session.secretWord });
});

// updated post request for secretWord
app.post("/secretWord", (req, res) => {
    if (req.body.secretWord.toUpperCase()[0] == "P") {
        req.flash("error", "That word won't work!");
        req.flash("error", "You can't use words that start with p.");
    } else {
        req.session.secretWord = req.body.secretWord;
        req.flash("info", "The secret word was changed.");
    }
    res.redirect("/secretWord");
});

// added for tires
const tires = require('./routes/jobs')
app.use("/tires", auth, csrf_middleware, tires);

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send(`That page (${req.url}) was not found.`);
});

// Error-handling middleware
app.use((err, req, res, next) => {
    res.status(500).send(err.message);
    console.log(err);
});

const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await require("./db/connect")(process.env.MONGO_URI);

        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
