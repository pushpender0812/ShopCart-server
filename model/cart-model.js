const mongoose = require("mongoose")
const Product = require("./product-model")
const User = require("./User")

const cartSchema = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
},{
    timestamps: true
})

const Cart = new mongoose.model("Cart",cartSchema)

module.exports = Cart