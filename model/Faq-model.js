const mongoose = require("mongoose")

const faqSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
      },
      category_name:{
        type:String
      },
      question:{
        type:String
      },
      answer:{
        type:String,
        default:null
      },
      isAnswered:{
        type:Boolean,
        default:false
      }

})


const FAQ = new mongoose.model('FAQ',faqSchema)

module.exports = FAQ