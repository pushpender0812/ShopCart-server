const Payment = require("../../../model/payment-model");
const Product = require("../../../model/product-model")
const User = require("../../../model/User")




const pendingOrders = async(req,res) => {
    try {
        // const viewOrders = await Payment.find({order_status:'Pending'}).populate("product_id").populate("user_id").populate("coupon_id");
        const viewOrders = await Payment.aggregate([{$match:{order_status:'Pending'}},{
                 $lookup:{
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: "userResult"
                 }
        },
        {
            $unwind:{
                path: "$userResult",
                preserveNullAndEmptyArrays: true
            }
        },{
            $lookup:{
                from: 'products',
                localField: 'product_id',
                foreignField: '_id',
                as: "productResult"
             }
        },
       
        {
            $lookup:{
                from: 'coupons',
                localField: 'coupon_id',
                foreignField: '_id',
                as: "couponResult"
             }
        },
        {
            $unwind:{
                path: "$couponResult",
                preserveNullAndEmptyArrays: true
            }
        }

    ])
       console.log(viewOrders,"push pejd");
        res.render("Layout", { body: "Orders/Pending",orders:viewOrders });
    } catch (error) {
        console.log(`Error while Viewing Pending Orders ${error}`);
    }
}



const getPendingOrdersData = async (req, res) => {
    const { draw, start, length, search, order, columns } = req.query;
  
    try {
      const searchQuery = search.value ? {
        $or: [
          { 'userResult.name': { $regex: search.value, $options: "i" } },
          { 'userResult.email': { $regex: search.value, $options: "i" } },
          { 'productResult.product_name': { $regex: search.value, $options: "i" } },
          // Add more fields to search on if needed
        ]
      } : {};
  
      const totalRecords = await Payment.countDocuments({ order_status: 'Pending' });
      const filteredRecords = await Payment.aggregate([
        { $match: { order_status: 'Pending' } },
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userResult' } },
        { $unwind: { path: '$userResult', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'productResult' } },
        { $lookup: { from: 'coupons', localField: 'coupon_id', foreignField: '_id', as: 'couponResult' } },
        { $unwind: { path: '$couponResult', preserveNullAndEmptyArrays: true } },
        { $match: searchQuery },
        { $count: 'filteredCount' }
      ]);
  
      const pendingOrders = await Payment.aggregate([
        { $match: { order_status: 'Pending' } },
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userResult' } },
        { $unwind: { path: '$userResult', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'productResult' } },
        { $lookup: { from: 'coupons', localField: 'coupon_id', foreignField: '_id', as: 'couponResult' } },
        { $unwind: { path: '$couponResult', preserveNullAndEmptyArrays: true } },
        { $match: searchQuery },
        { $skip: parseInt(start) },
        { $limit: parseInt(length) },
        { $sort: { [columns[order[0].column].data]: order[0].dir === 'asc' ? 1 : -1 } }
      ]);
  
      const data = pendingOrders.map((order, index) => {
        const products = order.product_id.map((productId, pIndex) => {
          const product = order.productResult.find(p => p._id.toString() === productId.toString());
          return {
            sNo: parseInt(start) + index + 1,
            razorpay_order_id: order.razorpay_order_id,
            user_name: order.userResult.name,
            user_email: order.userResult.email,
            user_phone: order.userResult.phone,
            product_name: product ? product.product_name : 'Product Not Found',
            quantity: order.total_quantity[pIndex].quantity,
            total_price: order.total_price,
            coupon_used: order.couponResult ? order.couponResult.coupon_name : 'N/A',
            order_status: order.order_status,
            actions: `
              <form action="/admin/user/orders/approve/${order._id}" method="POST">
                <button type="submit" class="btn btn-success btn-sm">Approve</button>
              </form>
              <form action="/admin/user/orders/reject/${order._id}" method="POST">
                <button type="submit" class="btn btn-danger btn-sm">Reject</button>
              </form>
            `
          };
        });
        return products;
      }).flat();
  
      res.json({
        draw: parseInt(draw),
        recordsTotal: totalRecords,
        recordsFiltered: filteredRecords.length > 0 ? filteredRecords[0].filteredCount : 0,
        data
      });
    } catch (error) {
      console.log("Error fetching pending orders data", error);
      res.status(500).send("Error fetching pending orders data");
    }
  };




const approveOrder = async(req,res) => {
        try {
            const _id = req.params.id

           await Payment.findOneAndUpdate({_id:_id},{order_status:'Approved'})

            res.redirect("/admin/user/orders/pending-orders")
        } catch (error) {
            console.log(`Error while approving Order ${error}`);
        }
}


const rejectOrder = async(req,res) => {
    try {
        const _id = req.params.id

       await Payment.findOneAndUpdate({_id:_id},{order_status:'Rejected'})

        res.redirect("/admin/user/orders/pending-orders")
    } catch (error) {
        console.log(`Error while Rejecting Order ${error}`);
    }
}


const approvedOrders = async(req,res) => {
    try {
        // const viewOrders = await Payment.find({order_status:'Approved'}).populate("product_id").populate("user_id").populate("coupon_id");

        const viewOrders = await Payment.aggregate([{$match:{order_status:'Approved'}},{
            $lookup:{
               from: 'users',
               localField: 'user_id',
               foreignField: '_id',
               as: "userResult"
            }
   },
   {
       $unwind:{
           path: "$userResult",
           preserveNullAndEmptyArrays: true
       }
   },{
       $lookup:{
           from: 'products',
           localField: 'product_id',
           foreignField: '_id',
           as: "productResult"
        }
   },
  
   {
       $lookup:{
           from: 'coupons',
           localField: 'coupon_id',
           foreignField: '_id',
           as: "couponResult"
        }
   },
   {
       $unwind:{
           path: "$couponResult",
           preserveNullAndEmptyArrays: true
       }
   }

])
        // console.log(viewOrders);
        res.render("Layout", { body: "Orders/Approved",orders:viewOrders });
    } catch (error) {
        console.log(`Error while Viewing Pending Orders ${error}`);
    }
}



const getApprovedOrdersData = async (req, res) => {
    const { draw, start, length, search, order, columns } = req.query;
  
    try {
      const searchQuery = search.value ? {
        $or: [
          { 'userResult.name': { $regex: search.value, $options: "i" } },
          { 'userResult.email': { $regex: search.value, $options: "i" } },
          { 'productResult.product_name': { $regex: search.value, $options: "i" } },
          // Add more fields to search on if needed
        ]
      } : {};
  
      const totalRecords = await Payment.countDocuments({ order_status: 'Approved' });
      const filteredRecords = await Payment.aggregate([
        { $match: { order_status: 'Approved' } },
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userResult' } },
        { $unwind: { path: '$userResult', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'productResult' } },
        { $lookup: { from: 'coupons', localField: 'coupon_id', foreignField: '_id', as: 'couponResult' } },
        { $unwind: { path: '$couponResult', preserveNullAndEmptyArrays: true } },
        { $match: searchQuery },
        { $count: 'filteredCount' }
      ]);
  
      const approvedOrders = await Payment.aggregate([
        { $match: { order_status: 'Approved' } },
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userResult' } },
        { $unwind: { path: '$userResult', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'productResult' } },
        { $lookup: { from: 'coupons', localField: 'coupon_id', foreignField: '_id', as: 'couponResult' } },
        { $unwind: { path: '$couponResult', preserveNullAndEmptyArrays: true } },
        { $match: searchQuery },
        { $skip: parseInt(start) },
        { $limit: parseInt(length) },
        { $sort: { [columns[order[0].column].data]: order[0].dir === 'asc' ? 1 : -1 } }
      ]);
  
      const data = approvedOrders.map((order, index) => {
        const products = order.product_id.map((productId, pIndex) => {
          const product = order.productResult.find(p => p._id.toString() === productId.toString());
          return {
            sNo: parseInt(start) + index + 1,
            razorpay_order_id: order.razorpay_order_id,
            user_name: order.userResult.name,
            user_email: order.userResult.email,
            user_phone: order.userResult.phone,
            product_name: product ? product.product_name : 'Product Not Found',
            quantity: order.total_quantity[pIndex].quantity,
            total_price: order.total_price,
            coupon_used: order.couponResult ? order.couponResult.coupon_name : 'N/A',
            order_status: order.order_status
          };
        });
        return products;
      }).flat();
  
      res.json({
        draw: parseInt(draw),
        recordsTotal: totalRecords,
        recordsFiltered: filteredRecords.length > 0 ? filteredRecords[0].filteredCount : 0,
        data
      });
    } catch (error) {
      console.log("Error fetching approved orders data", error);
      res.status(500).send("Error fetching approved orders data");
    }
  };
  





const rejectedOrders = async(req,res) => {
    try {
        // const viewOrders = await Payment.find({order_status:'Rejected'}).populate("product_id").populate("user_id").populate("coupon_id");
       
        const viewOrders = await Payment.aggregate([{$match:{order_status:'Rejected'}},{
            $lookup:{
               from: 'users',
               localField: 'user_id',
               foreignField: '_id',
               as: "userResult"
            }
   },
   {
       $unwind:{
           path: "$userResult",
           preserveNullAndEmptyArrays: true
       }
   },{
       $lookup:{
           from: 'products',
           localField: 'product_id',
           foreignField: '_id',
           as: "productResult"
        }
   },
  
   {
       $lookup:{
           from: 'coupons',
           localField: 'coupon_id',
           foreignField: '_id',
           as: "couponResult"
        }
   },
   {
       $unwind:{
           path: "$couponResult",
           preserveNullAndEmptyArrays: true
       }
   }

])
       
       
        // console.log(viewOrders);
        res.render("Layout", { body: "Orders/Rejected",orders:viewOrders });
    } catch (error) {
        console.log(`Error while Viewing Pending Orders ${error}`);
    }
}




const getRejectedOrdersData = async (req, res) => {
    const { draw, start, length, search, order, columns } = req.query;
  
    try {
      const searchQuery = search.value ? {
        $or: [
          { 'userResult.name': { $regex: search.value, $options: "i" } },
          { 'userResult.email': { $regex: search.value, $options: "i" } },
          { 'productResult.product_name': { $regex: search.value, $options: "i" } },
          // Add more fields to search on if needed
        ]
      } : {};
  
      const totalRecords = await Payment.countDocuments({ order_status: 'Rejected' });
      const filteredRecords = await Payment.aggregate([
        { $match: { order_status: 'Rejected' } },
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userResult' } },
        { $unwind: { path: '$userResult', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'productResult' } },
        { $lookup: { from: 'coupons', localField: 'coupon_id', foreignField: '_id', as: 'couponResult' } },
        { $unwind: { path: '$couponResult', preserveNullAndEmptyArrays: true } },
        { $match: searchQuery },
        { $count: 'filteredCount' }
      ]);
  
      const rejectedOrders = await Payment.aggregate([
        { $match: { order_status: 'Rejected' } },
        { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'userResult' } },
        { $unwind: { path: '$userResult', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'products', localField: 'product_id', foreignField: '_id', as: 'productResult' } },
        { $lookup: { from: 'coupons', localField: 'coupon_id', foreignField: '_id', as: 'couponResult' } },
        { $unwind: { path: '$couponResult', preserveNullAndEmptyArrays: true } },
        { $match: searchQuery },
        { $skip: parseInt(start) },
        { $limit: parseInt(length) },
        { $sort: { [columns[order[0].column].data]: order[0].dir === 'asc' ? 1 : -1 } }
      ]);
  
      const data = rejectedOrders.map((order, index) => {
        const products = order.product_id.map((productId, pIndex) => {
          const product = order.productResult.find(p => p._id.toString() === productId.toString());
          return {
            sNo: parseInt(start) + index + 1,
            razorpay_order_id: order.razorpay_order_id,
            user_name: order.userResult.name,
            user_email: order.userResult.email,
            user_phone: order.userResult.phone,
            product_name: product ? product.product_name : 'Product Not Found',
            quantity: order.total_quantity[pIndex].quantity,
            total_price: order.total_price,
            coupon_used: order.couponResult ? order.couponResult.coupon_name : 'N/A',
            order_status: order.order_status
          };
        });
        return products;
      }).flat();
  
      res.json({
        draw: parseInt(draw),
        recordsTotal: totalRecords,
        recordsFiltered: filteredRecords.length > 0 ? filteredRecords[0].filteredCount : 0,
        data
      });
    } catch (error) {
      console.log("Error fetching rejected orders data", error);
      res.status(500).send("Error fetching rejected orders data");
    }
  };

module.exports = {pendingOrders,approveOrder,rejectOrder,approvedOrders,rejectedOrders,getPendingOrdersData,getApprovedOrdersData,getRejectedOrdersData}