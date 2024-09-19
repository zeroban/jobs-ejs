// const mongoose = require('mongoose')

// const connectDB = (url) => {
//   return mongoose.connect(url, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
//   })
// }

// module.exports = connectDB





// WEEK14 ASSIGNMENT UPDATE ///////////////////////

const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose.connect(url, {});
};

module.exports = connectDB;

////////////////////////////////////////////////////