const express = require("express");
const path = require("path")
const {
  registerUser,
  loginUser,
  gettingCategoryData,
  gettingProductData,
  addToWishlist,
  meCurrentUser,
  viewWishList,
  removeWishList,
  addToCart,
  viewCart,
  removeFromCart,
  updateCartQuantity,
  updateProfile,
  updateUserPass,
  getCouponInCart,
  orderRezorpay,
  paymentVerification,
  keyForPayment,
  viewMyOrders,
  askQuestion,
  seeAnswer,
  viewBlogs,
  viewSingleBlog,
  moveToCart
  
} = require("../../controllers/apiController/api-user-controller");
const authMiddleware = require("../../middleware/auth-middleware");

const router = express.Router();




const multer = require("multer");
// Multer configuration
// Storage engine setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null,path.join('uploads'));
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
// File type filtering
const fileFilter = function (req, file, cb) {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG files are allowed!"), false);
  }
};
//middleware for upload file
const upload = multer({ storage: storage, fileFilter: fileFilter });






router.route("/add-wishlist").post(authMiddleware,addToWishlist);

router.route("/view-wishlist").get(authMiddleware,viewWishList); 

router.route("/user-me").get(authMiddleware, meCurrentUser);

router.route("/remove-wishlist").post(authMiddleware,removeWishList);

router.route("/addtocart").post(authMiddleware,addToCart)  

router.route("/movetocart").post(authMiddleware,moveToCart)

router.route("/view-cart").get(authMiddleware,viewCart)

router.route("/remove-cart").post(authMiddleware,removeFromCart)

router.route("/update-cart-quantity").post(authMiddleware,updateCartQuantity)

router.route("/edit-profile").post(authMiddleware,upload.single("image"),updateProfile)

router.route("/update-password").post(authMiddleware,updateUserPass)

router.route("/get-coupon").get(authMiddleware,getCouponInCart)

router.route("/checkout").post(authMiddleware,orderRezorpay)

router.route("/paymentverification").post(authMiddleware,paymentVerification)

router.route("/key").get(authMiddleware,keyForPayment)

router.route("/view-myorder").get(authMiddleware,viewMyOrders)

router.route("/ask-question").post(authMiddleware,askQuestion)

router.route("/get-answer").get(seeAnswer)

router.route("/view-blogs").get(viewBlogs)

router.route("/view-singleblog").get(viewSingleBlog)

module.exports = router;
