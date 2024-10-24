require("dotenv").config()
require("./db/conn")
const express = require("express")
const adminRoutes = require("./routes/adminRoutes/admin-routes")
const apiRoutes = require("./routes/apiRoutes/api-routes")
const path = require("path")
const cookieParser = require('cookie-parser')
const cors = require("cors")
const Razorpay = require("razorpay")
const chance = require('chance').Chance()
const shuffleArray = require('shuffle-array')


const app = express()

app.use(cookieParser())

const corsOptions = {
    origin:"https://shopcart-client-omega.vercel.app",
    method:"GET,POST,PUT,PATCH,DELETE,HEAD",
    credential:true
}

app.use(cors(corsOptions))


app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//to serve static files
app.use(express.static(path.join(__dirname, 'public'))); 
app.use('/uploads', express.static('uploads'));  
app.set("view engine","ejs")
app.set('views',path.resolve('./views'))


const data = {
    headers:["Name","Age","Profession","Country"],
    rows: new Array(10).fill(undefined).map(() => {
        return [
               chance.name(),
               chance.age(),
               chance.profession(),
               chance.country({full:true})
        ]
    })
}

app.get("/t",(req,res) => {
    return res.json(
       'ShopCart Admin Pannel'
    )
})


app.use("/admin",adminRoutes)

app.use("/api",apiRoutes);

 const PORT = process.env.PORT || 3000

 
app.listen(PORT,() => {
    console.log("Server running at port 3000");
})