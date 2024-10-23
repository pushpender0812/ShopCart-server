const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
         author_name:{
            type:String
         },
         blog_name:{
            type:String
         },
         blog_description:{
            type:String
         }, 
         blog_category:{
            type:String
         },
         blog_image:{
            type:String
         }
},
{
  timestamps: true,
  versionKey: false,
})

const Blog = new mongoose.model('Blog',blogSchema)


module.exports = Blog