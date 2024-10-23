const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://pyadav96800:yadav%4012@cluster0.414c6.mongodb.net/E-commerce").then(() => {
    console.log("mongo db connected successfully");
}).catch((err) => {
    console.log(err);
})