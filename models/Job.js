const mongoose = require('mongoose')

// worked on building out my own schema like that assignment suggested
const tireSchema = new mongoose.Schema({
    brand: {
        type: String,
        require: [true, 'Please provide the brand of the tire'],
        maxlenght: 50
    },
    size: {
        type: String,
        require: [true, 'please enter in the size of the tire'],
        maxlenght: 15
    },
    location: {
        type: String,
        require: [true, 'Please provide a location of where the tires are located'],
        enum: ['Mebane', 'Greensboro'],
        default: 'Mebane'
    },
    price: {
        type: Number,
        require: [true, 'please enter in the price of each tire'],
        min: 0 // ensures the price is not negative 
    },
    warranty: {
        type: String,
        maxlenght: 50
    },
    quantity: {
        type: Number,
        require: [true, 'please enter the quantity of tires you have'],
        min: 0 // ensures they can not enter in a negative number 
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    }
}, { timestamps: true })



module.exports = mongoose.model('tires', tireSchema)