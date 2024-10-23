const Category = require("../../../model/category-model")
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const path = require("path")




const getAllCategory = async(req,res) => {
    res.render("Layout", { body: "Category/AddCategory" });
}

const addCategory = async(req,res) => {
    try {
        const {category_name} = req.body
      
        const image = req.file.filename;
        // console.log(image);

        const category = new Category({
            category_name,
            image
        }) 
        await category.save()
        res.redirect("/admin/user/category/add-category");

    } catch (error) {
        res.status(500).json({message:"Internal server error"});
    }
}


const viewCategory = async(req,res) => {
  
    try {
    //   const categoryData =  await Category.find({product_id:null})
      const categoryData =  await Category.aggregate([{$match:{product_id:null}}])
   
  
      res.render("Layout", { body: "Category/ViewCategory",data:categoryData})
    } catch (error) {
        res.staus(500).json({message:"Internal server error while view cart"})
    }
}


const viewCategoryTable = async (req, res) => {
    try {
        const { draw, start, length, search, order, columns } = req.query;
        // console.log(req.query,"sdho iljb");

        // Define search query
        const searchQuery = search.value ? {
            category_name: { $regex: search.value, $options: 'i' }
        } : {};

        // Count total documents
        const totalRecords = await Category.countDocuments({ product_id: null });

        // Count filtered documents
        const filteredRecords = await Category.countDocuments({
            ...searchQuery,
            product_id: null
        });

        // Fetch paginated and sorted data
        const categories = await Category.aggregate([
            { $match: { ...searchQuery, product_id: null } },
            { $sort: { [columns[order[0].column].data]: order[0].dir === 'asc' ? 1 : -1 } },
            { $skip: parseInt(start) },
            { $limit: parseInt(length) }
        ]);

        res.json({
            draw: parseInt(draw),
            recordsTotal: totalRecords,
            recordsFiltered: filteredRecords,
            data: categories.map((category, index) => ({
                sNo: start + index + 1,
                ...category
            }))
        });
    } catch (error) {
        console.log("Error while displaying categories", error);
        res.status(500).send("Error while displaying categories");
    }
};


const deleteCategory = async(req,res) => {
    try {
        const _id = req.params.id;
        // const changleboolean = await Category.findOne({_id:req.params.id})
        const changleboolean = await Category.aggregate([{$match:{_id:new mongoose.Types.ObjectId(req.params.id)}}])
        // await Category.findByIdAndUpdate({_id:changleboolean.product_id},{toView:false,todelete:true})
        await Category.updateOne(
            {_id:new mongoose.Types.ObjectId(changleboolean.product_id)},
            {$set:{toView:false,todelete:true}}
        )
        // console.log(changleboolean);



        // const deleteImage = await Category.findOne({_id:_id})
        const deleteImage = await Category.aggregate([{$match:{_id:new mongoose.Types.ObjectId(_id)}}])

        // console.log("Image name to be Updated",deleteImage);

        if (deleteImage.image) {
            fs.unlink(path.join(__dirname, '../../../uploads', deleteImage.image), (err) => {
                if (err) {
                    console.error("Error while deleting the image", err);
                    return;
                }
                console.log("Image Updated successfully");
            });
        } else {
            console.log("No Such Image Exists");
        }



        await Category.findByIdAndDelete(_id)
        
        res.redirect("/admin/user/category/view-category")  
        console.log("category deleted successfull");
    } catch (error) {
        console.log(error);
    }
}


const getCategory = async(req,res) => {
    try {
        const _id = req.params.id
        const getCat = await Category.findOne({_id:_id})
        
        // console.log(getCat);
        res.render("Layout", { body: "Category/EditCategory",data:getCat });
    } catch (error) {
        console.log(error);
    }
}

const updateCategory = async(req,res) => {
    try {
        const _id = req.params.id
        // console.log(req.body.category_name);
        if(req.file)
            {


                const deleteImage = await Category.findOne({_id:_id})

                // console.log("Image name to be Updated",deleteImage);
        
                if (deleteImage.image) {
                    fs.unlink(path.join(__dirname, '../../../uploads', deleteImage.image), (err) => {
                        if (err) {
                            console.error("Error while deleting the image", err);
                            return;
                        }
                        console.log("Image Updated successfully");
                    });
                } else {
                    console.log("No Such Image Exists");
                }




                const updateCart = await  Category.findByIdAndUpdate({_id},{category_name:req.body.category_name,image:req.file.filename});
                return res.redirect("/admin/user/category/view-category");
            }
        const updateCart = await Category.findByIdAndUpdate({_id},{category_name:req.body.category_name});
        return res.redirect("/admin/user/category/view-category");
       
    } catch (error) {
        console.log(error);
    }
}

const addtosubCategory = async(req,res) => {
    const _id = req.params.id
    // console.log(_id);
    res.render("Layout", { body: "Category/AddSubCategory",id:_id });
}

const addSubCategory = async (req,res) => {
    try {
        const {category_name} = req.body
        // console.log(category_name);
        const image = req.file.filename;
        console.log(image);
       

        const category = new Category({
            product_id:req.params.id,
            category_name,
            image
        }) 

        const changleboolean = await Category.findByIdAndUpdate({_id:req.params.id},{toView:true,todelete:false})



        await category.save()
        // res.render("AddSubCategory")
        res.redirect("/admin/user/category/view-category");
    } catch (error) {
        res.status(500).json({message:"Internal server error",error:error});
    }
}


const viewSubCategory = async(req,res) => {
    try {
        const _id = req.params.id
        const categoryData =  await Category.find({product_id:_id})
        // SubAvailArray.push(categoryData)
        // console.log("in view category datat",SubAvailArray);

        const changleboolean = await Category.findByIdAndUpdate({_id:req.params.id},{toView:true,todelete:false})
        
        res.render("Layout", { body: "Category/ViewSubCategory",data:categoryData});
      } catch (error) {
          res.staus(500).json({message:"Internal server error while view cart"})
      }
}





module.exports = {addCategory,viewCategory,deleteCategory,getCategory,updateCategory,getAllCategory,addSubCategory,addtosubCategory,viewSubCategory,viewCategoryTable}