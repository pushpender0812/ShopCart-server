const express = require("express")
const {addCoupon,couponforAdd,viewAllCoupons,deleteCoupon,editCoupon,updateCoupon,getCouponsData} = require("../../../controllers/adminController/coupon/coupon-controller")

const router = express.Router();

router.route("/add-coupon").get(couponforAdd)

router.route("/add-coupon").post(addCoupon)

router.route("/view-coupon").get(viewAllCoupons)

router.get("/get-coupons-data", getCouponsData);

router.route("/delete-coupon/:id").get(deleteCoupon)

router.route("/edit-coupon/:id").get(editCoupon)

router.route("/update-coupon/:id").post(updateCoupon)

module.exports = router