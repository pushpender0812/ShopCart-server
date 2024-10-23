const mongoose = require("mongoose")

 const couponSchema = new mongoose.Schema({
      coupon_name:{
        type:String
      },
      coupon_value:{
        type:String
      },
      expire_date:{
        type:String
      },
      coupon_type:{
        type:String
      },
      min_cart:{
        type:String
      },
      maximum_discount:{
        type:String
      }
 },{
    timestamps:true,
    versionKey:false
})

const Coupon = new mongoose.model("Coupon",couponSchema)

module.exports = Coupon