// const Job = require('../models/Job');
const Tires = require('../models/Job');
const { logoff } = require('./sessionController');


const getAllTires = async (req, res) => {
    // console.log("getAllTires was called");

    try {
        // DO NOT FORGET ABOUT req.user._id 
        const tires = await Tires.find({ createdBy: req.user._id }).sort('createdAt');
        // console.log(tires); // Log the fetched tires to see what you get
        return res.render("tires", { tires, errors: req.flash("error") });
    } catch (error) {
        console.error("Error fetching tires:", error);
        res.status(500).send("Server Error");
    }
};


const getCreate = async (req, res) => {
    // console.log("I am in the getCreate section");

    res.render("tire", { tire: null });
}

const getTire = async (req, res) => {
    // console.log("I am in the getTire section! This is a pain!");
    const { user: { _id: userId }, params: { id: tireID } } = req;

    try {
        // Locate the tire that was created by this user
        const tire = await Tires.findOne({ _id: tireID, createdBy: userId });

        // Check if the tire exists
        if (!tire) {
            // Flash error message and redirect
            req.flash("error", `No tire found with ID: ${tireID}`);
            return res.redirect("/tires");
        }

        // Pulls the tire details page
        return res.render("tire", { tire, errors: req.flash("error") });
    } catch (err) {
        // Handle potential errors from the database query
        console.error("Error fetching tire:", err);
        req.flash("error", "An error occurred while fetching the tire.");
        return res.redirect("/tires");
    }
};



const createTire = async (req, res) => {
    // console.log("You are in the createTire section");
    req.body.createdBy = req.user._id;

    try {
        // create a tire
        await Tires.create(req.body);

        // flash a success message and redirect
        req.flash("info", "Tire added successfully.");
        return res.redirect("/tires");
    } catch (e) {
        // log error message
        console.error("Error creating tire:", e);
        // flash an error message
        req.flash("error", "There was an issue creating the tire. Please try again.");

        // Render the same form with an error message
        return res.render("tire", { tire: req.body, errors: req.flash("error") });
    }
};


const updateTire = async (req, res) => {
    // searches for the userID and tireID to make sure they match
    // console.log("i am in the updateTire section");

    const {
        body: { brand, size, location, price, quantity },
        user: { _id: userId },
        params: { id: tireID },
    } = req

    // will check for blank fields
    if (brand === "" || size === "" || location === "" || price === "" || quantity === "") {
        throw new error(`Be sure that all fields are filled in. Can not be null/blank`)
    }

    const tires = await Tires.findByIdAndUpdate({ _id: tireID, createdBy: userId }, req.body, { new: true, runValidators: true })

    if (!tires) {
        console.log(`No tire found with ID: ${tireID}`)
    }
    // res.status(StatusCodes.OK).json({ tires })

}

const deleteTire = async (req, res) => {
    // console.log("I am in the delete section");

    const {
        user: { _id: userId },
        params: { id: tireID }
    } = req;

    try {
        // Changed findOneAndRemove to use findOneAndDelete instead
        const tire = await Tires.findOneAndDelete({
            _id: tireID,
            createdBy: userId
        });

        if (!tire) {
            req.flash("error", `No tire found with ID: ${tireID}`);
            return res.redirect("/tires");
        }

        // Success message and redirect
        req.flash("Tire deleted successfully.");
        return res.redirect("/tires");
    } catch (e) {
        // Error handling section
        console.error("Error deleting tire:", e);
        req.flash("error", "Error deleting the tire. Please try again.");
        return res.redirect("/tires");
    }
};





module.exports = {
    getAllTires,
    getCreate,
    getTire,
    createTire,
    updateTire,
    deleteTire,


}
