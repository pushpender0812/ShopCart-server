const express = require("express")
const {pendingOrders,approveOrder,rejectOrder,approvedOrders,rejectedOrders,getApprovedOrdersData,getPendingOrdersData,getRejectedOrdersData} = require("../../../controllers/adminController/orders/orders-controller")

const router = express.Router()

router.route("/pending-orders").get(pendingOrders)

router.get("/get-pending-orders-data", getPendingOrdersData);

router.route("/approve/:id").post(approveOrder)

router.route("/reject/:id").post(rejectOrder)

router.route("/approved-orders").get(approvedOrders)

router.get("/get-approved-orders-data", getApprovedOrdersData);

router.route("/rejected-orders").get(rejectedOrders)

router.get("/get-rejected-orders-data", getRejectedOrdersData);


module.exports = router