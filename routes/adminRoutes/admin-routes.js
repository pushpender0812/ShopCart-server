const express = require("express")
// const {Login,} = require("../../controllers/adminController/admin-controller")
const beforeLogin = require("../../middleware/bforeLogin-middleware")
// const authMiddleware = require("../../middleware/auth-middleware")

const router = express.Router();
const adminUserRoutes = require("./admin-user-routes");
const auth = require("../../middleware/admin-middleware");
const { Login } = require("../../controllers/adminController/admin-user-controller");
const { Register } = require("../../controllers/apiController/api-controller");



router.get("/login",beforeLogin,(req,res) => {
    res.render("Login")
})
router.post("/login",beforeLogin,Login)

router.route("/register").post(Register)


router.use("/user",auth,adminUserRoutes);

module.exports = router