const express = require("express");
const path = require("path")

const router = express.Router();
const {
  addCategory,viewCategory,deleteCategory,getCategory,updateCategory,getAllCategory,addSubCategory,addtosubCategory,viewSubCategory,viewCategoryTable
} = require("../../../controllers/adminController/category/category-controller");

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


router.route("/add-category").get(getAllCategory)

router.route("/add-category").post(upload.single("image"), addCategory);

router.route("/view-category").get(viewCategory)


router.route("/get-categories-data").get(viewCategoryTable)

router.route("/delete/:id").get(deleteCategory)

router.route("/get-category/:id").get(getCategory)

router.route("/update-category/:id").post(upload.single("image"),updateCategory)

router.route("/addtoSub-category/:id").get(addtosubCategory)

router.route("/addSub-category/:id").post(upload.single("image"),addSubCategory)

router.route("/viewSub-category/:id").get(viewSubCategory)


module.exports = router;
