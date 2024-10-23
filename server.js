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
    origin:"http://localhost:5173",
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

app.get("/test",(req,res) => {
    return res.json(
        {
            headers:data.headers,
            rows:shuffleArray(data.rows),
            lastUpdated:new Date().toISOString()
        }
    )
})


app.use("/admin",adminRoutes)

app.use("/api",apiRoutes);

 

 
app.listen(3000,() => {
    console.log("Server running at port 3000");
})