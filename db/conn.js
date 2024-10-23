const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/E-Commerce").then(() => {
    console.log("mongo db connected successfully");
}).catch((err) => {
    console.log(err);
})