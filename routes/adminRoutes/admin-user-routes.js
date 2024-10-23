const express = require("express")

const router = express.Router();
const categoryRoutes = require("./category/category-routes")
const productRoutes = require("./product/product-routes");
const { logout, updatePassword,viewAllUsers,deleteUser,blockUser,unblockUser ,getUsersData,viewUserSale} = require("../../controllers/adminController/admin-user-controller");
const couponRoutes = require(".././adminRoutes/coupon/coupon-routes")
const ordersRoute = require("../../routes/adminRoutes/order/order-routes")
const faqQustions = require("../adminRoutes/faq/faq-routes")
const blogPages = require("../adminRoutes/blog/blog-routes");
const Payment = require("../../model/payment-model");
const User = require("../../model/User");

router.get("/dashboard",async(req,res) => {
    try {
        const orders =  await Payment.find({order_status:"Approved"})
        const totalUser = await User.find({type:'User'})
       //  console.log(totalUser,"pusjfb sjfl");
           res.render("Layout",{body:"Dashboard",data:{orders,totalUser}})
    } catch (error) {
        console.log(error);
    }

})

router.get("/updatepassword",(req,res) => {
    res.render("UpdatePassword")
})

router.route("/logout").get(logout)

router.route("/updatepassword").post(updatePassword)

router.route("/view-allusers").get(viewAllUsers)

router.get("/data", getUsersData);

router.route("/delete-user/:id").get(deleteUser)

router.route("/block-user/:id").get(blockUser)

router.route("/view-usersale/:id").get(viewUserSale)

router.route("/unblock-user/:id").get(unblockUser)


router.use("/category",categoryRoutes)

router.use("/product",productRoutes)

router.use("/coupon",couponRoutes)

router.use("/orders",ordersRoute)

router.use("/faq",faqQustions)

router.use("/blog",blogPages)

module.exports = router