const User = require("../../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Payment = require("../../model/payment-model");
const { default: mongoose } = require("mongoose");
// var Datatable = require("datatables.net-dt");

const Login = async (req, res) => {
  // res.render("Login")
  try {
    const email = req.body.email;
    const password = req.body.password;
    console.log(`entered email is ${email} and password is ${password}`);

    const useremail = await User.findOne({ email: email });

    if (!useremail) {
      return res.status(400).send("invalid login email");
    }

    const isMatch = await bcrypt.compare(password, useremail.password);

    // console.log(process.env.SECRET_KEY);

    // console.log(`the entered password is ${password} and saved password is ${useremail.password}`);

    const token = await jwt.sign(
      { _id: useremail._id.toString() },
      process.env.SECRET_KEY
    );

    res.cookie("jwt", token, {
      httpOnly: true,
    });

    if (isMatch === true) {
      res.status(200).redirect("/admin/user/dashboard");
    } else {
      res.json("Invalid Password details");
    }
  } catch (error) {
    console.log(error);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { email, password, newPassword } = req.body;
    // console.log(email," ",password," " ,newPassword);
    const useremail = await User.findOne({ email: email });

    const isMatch = await bcrypt.compare(password, useremail.password);

    const passwordHash = await bcrypt.hash(newPassword, 10);

    if (isMatch === true) {
      const userToUpdate = await User.findOneAndUpdate(
        { email: email },
        { password: passwordHash }
      );
      console.log("password Updated Successfully");
      res.status(200).redirect("/admin/user/dashboard");
    } else {
      console.log("Password Not Matched");
    }

    //   console.log(userToUpdate);
  } catch (error) {
    console.log("Error while updating Password", error);
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    console.log("Logout Success");
    res.redirect("/admin/login");
  } catch (error) {
    console.log("Error While Logging Out", error);
  }
};

const viewAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({ type: "User" });

    const sales = await Payment.find({ order_status: "Approved" });

    res.render("Layout", { body: "AllUsers", data: { allUsers, sales } });
  } catch (error) {
    console.log("Error While Viewing All Users", error);
  }
};

// getting server side table users data

const getUsersData = async (req, res) => {
    console.log("Fetching user data for DataTable");
    const { draw, start, length, search, order, columns } = req.query;
  
    try {
      // Include type: "User" in the search query
      const searchQuery = {
        type: "User",
        $or: [
          { name: { $regex: search.value, $options: "i" } },
          { email: { $regex: search.value, $options: "i" } },
          // Add more fields to search on if needed
        ]
      };
  
      const totalRecords = await User.countDocuments({ type: "User" });
      const filteredRecords = await User.countDocuments(searchQuery);
      const allUsers = await User.find(searchQuery)
        .skip(parseInt(start))
        .limit(parseInt(length))
        .sort({ [columns[order[0].column].data]: order[0].dir === 'asc' ? 1 : -1 });
  
      const data = allUsers.map((user, index) => ({
        sNo: parseInt(start) + index + 1,
        name: user.name,
        email: user.email,
        type: user.type,
        sales: `<a href="/admin/user/view-usersale/${user._id}"><button type="button">&#128065;</button></a>`,
        actions: `
          <a href="/admin/user/delete-user/${user._id}" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this user?')">
            <button type="button" class="btn btn-danger btn-sm">Delete</button>
          </a>
          ${user.isblocked ? `
            <a href="/admin/user/unblock-user/${user._id}" class="btn btn-success btn-sm">
              <button type="button" class="btn btn-success btn-sm">Unblock</button>
            </a>
          ` : `
            <a href="/admin/user/block-user/${user._id}" class="btn btn-danger btn-sm">
              <button type="button" class="btn btn-success btn-sm">Block</button>
            </a>
          `}
        `
      }));
  
      res.json({
        draw: parseInt(draw),
        recordsTotal: totalRecords,
        recordsFiltered: filteredRecords,
        data
      });
    } catch (error) {
      console.log("Error fetching users data", error);
      res.status(500).send("Error fetching users data");
    }
  };
  
  

// getting server side table users data

const deleteUser = async (req, res) => {
  try {
    // console.log("jh");
    const _id = req.params.id;
    const userDelete = await User.findByIdAndDelete({ _id: _id });
    res.redirect("/admin/user/view-allusers");
  } catch (error) {
    console.log("Error While Deleting this User");
  }
};

const blockUser = async (req, res) => {
  try {
    const _id = req.params.id;
    console.log(_id, "dfhugui");
    const blockuser = await User.findByIdAndUpdate(
      { _id: _id },
      { isblocked: true }
    );
    res.redirect("/admin/user/view-allusers");
  } catch (error) {
    console.log("Error While Blocking the User");
  }
};

const unblockUser = async (req, res) => {
  try {
    const _id = req.params.id;
    const blockuser = await User.findByIdAndUpdate(
      { _id: _id },
      { isblocked: false }
    );
    res.redirect("/admin/user/view-allusers");
  } catch (error) {
    console.log("Error While Unblocking the User");
  }
};

const viewUserSale = async (req, res) => {
  try {
    // const sales = await Payment.find({user_id:req.params.id}).populate("product_id").populate("user_id").populate("coupon_id");
    const sales = await Payment.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(req.params.id) } },
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
    res.render("Layout", { body: "UserSale", data: sales });
  } catch (error) {
    console.log(error, "While Viewing sales");
  }
};

module.exports = {
  Login,
  updatePassword,
  logout,
  viewAllUsers,
  deleteUser,
  blockUser,
  unblockUser,
  viewUserSale,
  getUsersData,
};
