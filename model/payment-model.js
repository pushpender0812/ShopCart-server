const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  razorpay_order_id: {
    type: String,
    // required:true
  },
  razorpay_payment_id: {
    type: String,
    // required:true
  },
  razorpay_signature: {
    type: String,
    // required:true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
    // required:true,
  },
  product_id: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:'Product'
  }],
  coupon_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Coupon'
  },
  total_price: {
    type: String,
  },
  total_quantity: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', 
    },
    quantity: {
      type: Number,
    }
  }],
  order_status:{
    type:String,
    enum:["Pending","Approved","Rejected"],
    // required:true
    default:"Pending"
},
});

const Payment = new mongoose.model("Payment", paymentSchema);

module.exports = Payment;
