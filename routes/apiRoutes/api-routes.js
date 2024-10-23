const express = require("express")
const {Register} = require("../../controllers/apiController/api-controller")
const userAuthenticetion = require("./api-user-routes")
const authMiddleware = require("../../middleware/auth-middleware");
const { gettingProductData, registerUser, loginUser, gettingCategoryData } = require("../../controllers/apiController/api-user-controller");

const router = express.Router();




// router.route("/user").get(userAuthenticetion)
router.route("/getproduct-data").get(gettingProductData);

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);


router.route("/getcategory-data").get(gettingCategoryData);

router.use("/user",userAuthenticetion)

module.exports = router