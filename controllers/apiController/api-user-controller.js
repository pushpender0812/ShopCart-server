const User = require("../../model/User");
const Category = require("../../model/category-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Product = require("../../model/product-model");
const WishList = require("../../model/wishlist-model");
const Cart = require("../../model/cart-model");
const Coupon = require("../../model/coupon-model");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../../model/payment-model");
const FAQ = require("../../model/Faq-model");
const Blog = require("../../model/blogs-model");
const { mongo, default: mongoose } = require("mongoose");

const registerUser = async (req, res) => {
  try {
    //  console.log(req.body,"dfdf");
    const { name, email, phone, password } = req.body;
    console.log(name, email, phone, password);

    const useremail = await User.findOne({ email: email });

    // console.log(useremail);

    if (useremail) {
      return res.status(400).json({ message: "email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // console.log(passwordHash);

    // console.log("token in backend register",useremail);

    const registerUser = new User({
      name,
      email,
      phone,

      password: passwordHash,
    });

    // console.log(registerUser);

    const usercreated = await registerUser.save();

    res.status(200).json({
      message: "user registered successfully",
      token: await usercreated.generateToken(),
      userId: usercreated._id.toString(),
    });

    // console.log(req.body);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internel server Error While registering User" });
  }
};

const loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(`entered email is ${email} and password is ${password}`);

    const useremail = await User.findOne({ email: email });

    if (!useremail) {
      return res.status(400).send({ message:"invalid login email,Email Does not Exist"});
    }

    const isMatch = await bcrypt.compare(password, useremail.password);
    console.log(isMatch);
    // console.log(process.env.SECRET_KEY);

    // console.log(`the entered password is ${password} and saved password is ${useremail.password}`);

    // const token = await  jwt.sign({_id:useremail._id.toString()},process.env.SECRET_KEY)

    // res.cookie("jwt",token,{
    //     httpOnly:true,
    // })

    // console.log(req.cookie.jwt);

    // console.log("data after login",useremail);

    if (isMatch === true) {
      if (useremail.isblocked === false) {
        return res.status(200).json({
          message: "User Login Successfully",
          token: await useremail.generateToken(),
          userId: useremail._id.toString(),
        });
       
      } else if (useremail.isblocked === true) {
        res
          .status(400)
          .json({ message: "User is Blocked Can't Login Contact Admin " });
        console.log("User Blocked By Admin");
      }
    } else if(isMatch === false) {
      res.status(400).json({message:"Invalid Password details"});
    }
  } catch (error) {
    console.log(error);
  }
};

const gettingCategoryData = async (req, res) => {
  try {
    const categoryData = await Category.find();

    res.json(categoryData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while view Category data" });
  }
};

const gettingProductData = async (req, res) => {
  try {
    const carts = await Cart.find({ user_id: req.userID });
    const productData = await Product.find();
    const updatedProductData = productData.map((product) => {
      const isInCart = carts.some(
        (cart) => cart.product_id.toString() === product._id.toString()
      );
      return { ...product._doc, wishlist: isInCart };
    });
    // console.log(updatedProductData,"sdfhdsf")
    res.json(updatedProductData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error while view Product data" });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    console.log(user_id, product_id);

    let wishlist = await WishList.findOne({ user_id: user_id });

    let checkProduct = await WishList.findOne({ product_id: product_id });
    console.log("check cart", checkProduct);
    // const checkCart = await Cart.findOne({
    //   user_id: user_id,
    //   product_id: product_id,
    // });

    if (checkProduct !== null) {
      return res.status(400).json({ message: "Product already in wishlist" });
    } else {
      wishlist = new WishList({
        user_id: user_id,
        product_id: product_id,
      });
      await wishlist.save();
      console.log("Wishlist Success");
      res.status(201).json({ message: "Wishlist success" });
    }
  } catch (error) {
    res.status(500).json({
      message: "Internal server Error While Adding Product to WishList",
    });
  }
};

const meCurrentUser = async (req, res) => {
  try {
    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.userID) } },
      { $project: { password: 0 } },
    ]);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "user data fetched successfully", result: user[0] });
  } catch (error) {
    res.status(500).json({ mesage: "internal server error" });
  }
};

const viewWishList = async (req, res) => {
  try {
    const user_id = req.userID;

    // const wishlist = await WishList.find({ user_id: user_id }).populate(
    //   "product_id"
    // );

    const wishlist = await WishList.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(user_id) } },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "result",
        },
      },
    ]);

    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({
      message: `internal server error While viewing Wishlist ${error}`,
    });
  }
};

const removeWishList = async (req, res) => {
  try {
    const { user_id, product_id } = req.query;
    console.log("Remove wishlist item", product_id);
    const deleteWishList = await WishList.findOneAndDelete({
      user_id,
      product_id,
    });
    if (deleteWishList) {
      res
        .status(200)
        .json({ message: "Product removed from WishList successfully" });
    } else {
      res.status(404).json({ message: "Product not found in WishList" });
    }
  } catch (error) {
    res.status(500).json({
      message: `Internal server error removing from Wishlist: ${error}`,
    });
  }
};

const moveToCart = async(req,res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
console.log(user_id,product_id
);
    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    
    let cartItem = await Cart.findOne({ user_id, product_id });
   

    if (cartItem) {
      console.log(cartItem,"pushpender");
     
      cartItem.quantity += 1;
      await cartItem.save();
      await WishList.findOneAndDelete({
        user_id,
        product_id,
      });
      return res.status(409).json({ message: "Product Quantity and WishList Updated SuccessFully" });
    } else {
      cartItem = new Cart({
        user_id,
        product_id,
        // quantity,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
      });

      await cartItem.save();
      await WishList.findOneAndDelete({
        user_id,
        product_id,
      });
      res
        .status(200)
        .json({ message: "Product Moved to cart successfully", cartItem });

      }

    
  } catch (error) {
    res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` });
  }
}

const addToCart = async (req, res) => {

  try {
    const { user_id, product_id, quantity } = req.body;

    const product = await Product.findById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // const wishlistCheck = await WishList.findOne({user_id,product_id})
    

    let cartItem = await Cart.findOne({ user_id, product_id });
    // let cartItem = await Cart.aggregate([{$match:{user_id:new mongoose.Types.ObjectId(user_id),product_id:new mongoose.Types.ObjectId(product_id)}}])

    if (cartItem) {
      console.log(cartItem,"yadavhg");
     
      cartItem.quantity += 1;
      await cartItem.save();
      return res.status(409).json({ message: "Product Quantity Updated SuccessFully" });
    } else {
      cartItem = new Cart({
        user_id,
        product_id,
        // quantity,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
      });

      await cartItem.save();
      res
        .status(200)
        .json({ message: "Product added to cart successfully", cartItem });

      }

    
  } catch (error) {
    res
      .status(500)
      .json({ message: `Internal server error: ${error.message}` });
  }
};

const viewCart = async (req, res) => {
  try {
    const user_id = req.userID;

    // const cart = await Cart.find({ user_id: user_id }).populate("product_id");
    const cart = await Cart.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(user_id) } },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "result",
        },
      },
    ]);

    res.status(200).json(cart);
  } catch (error) {
    res
      .status(500)
      .json({ message: `internal server error While viewing Cart ${error}` });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { user_id, product_id } = req.query;
    // console.log("Remove wishlist item", product_id);
    const deleteWishList = await Cart.findOneAndDelete({ user_id, product_id });
    if (deleteWishList) {
      res
        .status(200)
        .json({ message: "Product removed from Cart successfully" });
    } else {
      res.status(404).json({ message: "Product not found in CartItems" });
    }
  } catch (error) {
    res.status(500).json({
      message: `Internal server error removing from CartItems: ${error}`,
    });
  }
};

const updateCartQuantity = async (req, res) => {
  // console.log("dhus");
  try {
    const { user_id, product_id } = req.query;
    const { quantity } = req.body;

    // console.log(user_id,product_id,quantity);
    const findCart = await Cart.findOneAndUpdate(
      { user_id: user_id, product_id: product_id },
      { quantity: quantity }
    );
  } catch (error) {
    res.status(500).json({
      message: `Internal server error while updating CartItems :${error}`,
    });
  }
};

const updateProfile = async (req, res) => {
  console.log(req.body);
  try {
    const { _id } = req.query;
    if (req.file) {
      req.body.image = req.file.filename;
      const user = await User.findOneAndUpdate({ _id: _id }, req.body);
      return res.status(200).json({ message: "Profile Updated Successfully" });
    } else {
      const user = await User.findOneAndUpdate({ _id: _id }, req.body);
      return res.status(200).json({ message: "Profile Updated Successfully" });
    }
  } catch (error) {
    res.status(500).json({
      message: `Internal server error while Edit User :${error}`,
    });
  }
};

const updateUserPass = async (req, res) => {
  try {
    const _id = req.query;
    const { password, new_password, confirm_password } = req.body;
    // console.log(password, " ", new_password, " ", confirm_password);
    const useremail = await User.findOne({ _id: _id });

    const isMatch = await bcrypt.compare(password, useremail.password);

    const passwordHash = await bcrypt.hash(new_password, 10);

    if (new_password === confirm_password) {
      if (isMatch === true) {
        const userToUpdate = await User.findOneAndUpdate(
          { _id: _id },
          { password: passwordHash }
        );
        console.log("password Updated Successfully");
        res.status(200).json({ message: "Password Updated SuccessFully" });
      }
    } else {
      console.log("Password Not Matched");
    }

    //   console.log(userToUpdate);
  } catch (error) {
    console.log("Error while updating Password", error);
  }
};

const getCouponInCart = async (req, res) => {
  try {
    const coupon = await Coupon.find();

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({
      message: `internal server error While Fetching Coupon ${error}`,
    });
  }
};

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.ROZARPAY_API_SECRET,
});

const orderRezorpay = async (req, res) => {
  try {
    const options = {
      amount: Number(req.body.amount * 100),
      currency: "INR",
    };

    const order = await instance.orders.create(options);
    // console.log(order);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log("eerror in rezorpay", error);
  }
};

const verifyPaymentSignature = (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
) => {
  const generated_signature = crypto
    .createHmac("sha256", instance.key_secret)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  return generated_signature === razorpay_signature;
};

const paymentVerification = async (req, res) => {
  console.log(req.body, "fdcuidgog");

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    product_id,
    coupon_id,
    total_price,
    total_quantity,
  } = req.body;
  // console.log(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (
    verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    )
  ) {
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_id: req.userID,
      product_id,
      coupon_id,
      total_price,
      total_quantity,
    });

    res.status(400).json({
      success: true,
    });
  } else {
    // Signature is invalid
    res.status(400).json({
      success: false,
      message: "Invalid signature",
    });
  }
};

const keyForPayment = async (req, res) => {
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY });
};

const viewMyOrders = async (req, res) => {
  try {
    const user_id = req.userID;
    // const viewOrders = await Payment.find({ user_id: user_id })
    //   .populate("product_id")
    //   .populate("user_id")
    //   .populate("coupon_id");

    const viewOrders = await Payment.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(user_id) } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userResult",
        },
      },
      {
        $unwind: {
          path: "$userResult",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product_id",
          foreignField: "_id",
          as: "productResult",
        },
      },

      {
        $lookup: {
          from: "coupons",
          localField: "coupon_id",
          foreignField: "_id",
          as: "couponResult",
        },
      },
      {
        $unwind: {
          path: "$couponResult",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    res.status(200).json(viewOrders);
  } catch (error) {
    console.log(`Error while Viewing Pending Orders ${error}`);
  }
};

const askQuestion = async (req, res) => {
  try {
    const { category_name, question } = req.body;
    console.log(category_name, question);

    const askedQustion = new FAQ({
      category_name,
      user_id: req.userID,
      question,
    });

    askedQustion.save();
    res.json({ message: "Qustion Send Successfully" });
  } catch (error) {
    console.log("Error While asking Question");
  }
};

const seeAnswer = async (req, res) => {
  try {
    const user_id = req.userID;
    // const viewAnswers = await FAQ.find({ isAnswered: true }).populate(
    //   "user_id"
    // );

    const viewAnswers = await FAQ.aggregate([
      { $match: { isAnswered: true } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "result",
        },
      },
      {
        $unwind: {
          path: "$result",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    res.status(200).json(viewAnswers);
  } catch (error) {
    console.log(`Error while Viewing Answers ${error}`);
  }
};

const viewBlogs = async (req, res) => {
  try {
    const viewBlogs = await Blog.find();

    res.status(200).json(viewBlogs);
  } catch (error) {
    console.log(`Error while Viewing Blogs ${error}`);
  }
};

const viewSingleBlog = async (req, res) => {
  // console.log("hjdg");
  try {
    const {_id} = req.query.id
    // console.log(req.query.id);
    // const viewBlog = await Blog.findOne({ _id: req.query.id });
    const viewBlog = await Blog.aggregate([{$match:{_id:new mongoose.Types.ObjectId(req.query.id)}}])

    res.status(200).json(viewBlog[0]);
  } catch (error) {
    console.log(`Error while Viewing Single Blogs ${error}`);
  }
};

module.exports = {
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
};
