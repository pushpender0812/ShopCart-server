const mongoose = require("mongoose")
const Product = require("./product-model")
const User = require("./User")

const wishlistSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    }
})

const WishList = new mongoose.model("Wishlist",wishlistSchema)

module.exports = WishList