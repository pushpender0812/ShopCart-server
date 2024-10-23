const Blog = require("../../../model/blogs-model");
const path = require("path");
const fs = require("fs");
const Category = require("../../../model/category-model");
const { default: mongoose } = require("mongoose");

const addblogPage = async (req, res) => {
  try {
    const catedata = await Category.find();
    res.render("Layout", { body: "Blogs/AddBlogs", data: catedata });
  } catch (error) {
    console.log(error);
  }
};

const blogData = async (req, res) => {
  const { author_name, blog_name, blog_description, blog_category } = req.body;
 
  const blog_image = req.file.filename;
  const strippedDescription = blog_description.replace(/<\/?[^>]+(>|$)/g, "");

  const datablog = new Blog({
    author_name,
    blog_name,
    blog_description: strippedDescription,
    blog_image,
    blog_category,
  });
  await datablog.save();
  res.redirect("/admin/user/blog/add-blog");
};

const viewBlogs = async (req, res) => {
  try {
    const blogdata = await Blog.find();
    res.render("Layout", { body: "Blogs/ViewBlogs", data: blogdata });
  } catch (error) {
    console.log(error);
  }
};



const viewBlogstable = async (req, res) => {
 
  try {
    const { draw, start, length, search, order, columns } = req.query;

    // Define search query
    const searchQuery = search.value ? {
      $or: [
        { 'author_name': { $regex: search.value, $options: 'i' } },
        { 'blog_name': { $regex: search.value, $options: 'i' } },
        { 'blog_category': { $regex: search.value, $options: 'i' } },
        { 'blog_description': { $regex: search.value, $options: 'i' } }
      ]
    } : {};

    // Count total documents
    const totalRecords = await Blog.countDocuments();

    // Count filtered documents
    const filteredRecords = await Blog.countDocuments(searchQuery);

    // Fetch paginated and sorted data
    const blogs = await Blog.find(searchQuery)
      .skip(parseInt(start))
      .limit(parseInt(length))
      .sort({ [columns[order[0].column].data]: order[0].dir === 'asc' ? 1 : -1 });

    res.json({
      draw: parseInt(draw),
      recordsTotal: totalRecords,
      recordsFiltered: filteredRecords,
      data: blogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).send('Error fetching blogs');
  }
};





const deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete({ _id: req.params.id });
    res.redirect("/admin/user/blog/view-blog");
  } catch (error) {
    console.log(error);
  }
};

const editBlog = async (req, res) => {
  try {
    // const editblg = await Blog.findOne({ _id: req.params.id });
    const editblg = await Blog.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
    ]);

    // const catedata = await Category.find()
    res.render("Layout", { body: "Blogs/EditBlog", data: editblg[0] });
  } catch (error) {
    console.log(error);
  }
};

const updateBlog = async (req, res) => {
  try {
    console.log(req.body);
    const _id = req.params.id;
    const blog_description = req.body.blog_description;
    

    if (req.file) {
      
      const deleteImage = await Blog.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(_id) } },
      ]);

      console.log("Image name to be Updated", deleteImage);

      if (deleteImage.blog_image) {
        console.log("jsdg");
        fs.unlink(
          path.join(__dirname, "../../../uploads", deleteImage.blog_image),
          (err) => {
            if (err) {
              console.error("Error while deleting the image", err);
              return;
            }
            console.log("Image Updated successfully");
          }
        );
      } else {
        console.log("No Such Image Exists");
      }
   
      const updatedData = {
        author_name: req.body.author_name,
        blog_name: req.body.blog_name,
        blog_description: blog_description,
        blog_category: req.body.blog_category,
        blog_image: req.file.filename,
      };

      const blog = await Blog.aggregate([
        {$match:{_id:new mongoose.Types.ObjectId(_id)}}
      ])

      if (blog.length === 0) {
        return res.status(404).send('Blog not Found')
      }

         await Blog.updateOne(
        {_id:new mongoose.Types.ObjectId(_id)},
        {$set:updatedData}  
      )
      
      return res.redirect("/admin/user/blog/view-blog");
    }
    

    const updatedData = {
      author_name: req.body.author_name,
      blog_name: req.body.blog_name,
      blog_description: blog_description,
      blog_category: req.body.blog_category,
    }

    await Blog.updateOne(
      {_id:new mongoose.Types.ObjectId(_id)},
      {$set:updatedData}
    )

    

    console.log("Blog Updated Successfully");
    return res.redirect("/admin/user/blog/view-blog");
  } catch (error) {
    console.log("Error while updating Blog", error);
  }
};

module.exports = {
  addblogPage,
  blogData,
  viewBlogs,
  deleteBlog,
  editBlog,
  updateBlog,
  viewBlogstable
};
