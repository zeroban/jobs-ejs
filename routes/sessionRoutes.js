const express = require("express");
const passport = require("passport");
const router = express.Router();

const {
    registerShow,
    registerDo,
    logoff,
    logonShow,
} = require("../controllers/sessionController");

router.route("/register").get(registerShow).post(registerDo);
router
    .route("/logon")
    .get(logonShow)
    .post(
        passport.authenticate("local", {
            successRedirect: "/",
            failureRedirect: "/sessions/logon",
            failureFlash: true,
        })
    );
router.route("/logoff").post(logoff);

module.exports = router;