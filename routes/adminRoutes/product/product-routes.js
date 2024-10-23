const express = require("express")
const { getAllproduct,addproductCategory,selectSubCategoryData ,viewProductsAdded,deleteproduct,getProduct,updateProduct,viewProductsAddedTable} = require("../../../controllers/adminController/product/product-controller")

const router = express.Router()
const path = require("path")


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

router.route("/add-product").get(getAllproduct)

router.route("/add-product").post(upload.single("product_image"),addproductCategory)   

// router.route("/view-product").get()

router.route("/get-categories").get(selectSubCategoryData)

router.route("/view-product").get(viewProductsAdded)

router.route("/get-products-data").get(viewProductsAddedTable)

router.route("/delete-product/:id").get(deleteproduct)


router.route("/get-product/:id").get(getProduct)

router.route("/update-product/:id").post(upload.single("image"),updateProduct)

module.exports = router