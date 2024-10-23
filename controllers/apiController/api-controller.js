const User = require("../../model/User");
const bcrypt = require("bcryptjs")

// console.log(process.env.SECRET_KEY);


const Register = async (req,res) => {
    try {

        const {name,email,type,password} = req.body;
        const passwordHash = await bcrypt.hash(password,10);
       
        // console.log(passwordHash);

        const registerUser = new User({
            name,
            email,
            type,
            password:passwordHash,
        })

      const registeredUser =  await registerUser.save()

      res.status(200).json({message:"user registered successfully"})
        
        // console.log(req.body);
    } catch (error) {
        res.status(500).json({message:"Internel server Error"})
    }
}

module.exports = {Register}