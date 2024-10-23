const mongoose = require("mongoose")

 const categorySchema = new  mongoose.Schema({
   product_id:{
        type: mongoose.Schema.Types.ObjectId,
        default:null
   },
   
   category_name:{
        type:String,
        required:true,
        unique:true
    },
    image:{
       type:String,
       required:true
     },
     toView:{
      type:Boolean,
      default:false
     },
     todelete:{
      type:Boolean,
      default:true
     }
 },{
    timestamps:true,
    versionKey:false
})

const Category  = new mongoose.model("Category",categorySchema)

module.exports = Category

