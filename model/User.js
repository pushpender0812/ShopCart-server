const { JsonWebTokenError } = require("jsonwebtoken");
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const userSchemma = new mongoose.Schema({
    type:{
        type:String,
        enum:["Admin","User"],
        // required:true
        default:"User"
    },
  
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    phone:{
         type:Number
    },
    password:{
        type:String,
        required:true
    },
        image:{
            type:String
        },
        isblocked:{
            type:Boolean,
            default:false
        },
    
},{
    timestamps:true,
    versionKey:false
})


userSchemma.methods.generateToken = async function(){
    try {
        return jwt.sign({
            userId:this._id.toString(),
            email:this.email,
            type:this.type
        },process.env.SECRET_KEY,{
            expiresIn:"30d"
        })
    } catch (error) {
        console.error(error);
    }
}



const User = mongoose.model("User",userSchemma)

module.exports = User