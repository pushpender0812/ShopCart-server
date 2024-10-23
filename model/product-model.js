const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    ],                                                                                                                                                                                                                                                                                                                                                                        

    category_name: {
      type: String,
      // required:true
    },
    child_category_name: {
      type: String,
      // required:true
    },
    product_name: {
      type: String,
    },
    image: {
      type: String,
    },
    product_price: {
      type: Number,
    },
    product_description: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;
