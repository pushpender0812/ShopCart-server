const express = require("express")
const path = require("path")
const {addblogPage,blogData,viewBlogs,deleteBlog,editBlog,updateBlog,viewBlogstable} = require("../../../controllers/adminController/blogs/blogs.controllers")

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








const router = express.Router()

router.route("/add-blog").get(addblogPage)

router.route("/blog-add").post(upload.single("blog_image"),blogData)

router.route("/view-blog").get(viewBlogs)

router.route('/get-blogs-data').get( viewBlogstable);

router.route("/delete-blog/:id").get(deleteBlog)

router.route("/edit-blog/:id").get(editBlog)

router.route("/blog-update/:id").post(upload.single("blog_image"),updateBlog)

module.exports = router