const express = require("express")
const {seeQustion,toAnswer,answerOfQustion,deleteAnswer,updateAnswer,UpdatedMessage} = require("../../../controllers/adminController/faq/faq-controllers")


const router = express.Router()

router.route("/questions").get(seeQustion)

router.route("/answer/:id").get(toAnswer)

router.route("/answer-qustion/:id").post(answerOfQustion)

router.route("/answer-delete/:id").get(deleteAnswer)

router.route("/answer-update/:id").get(updateAnswer)

router.route("/updated-message/:id").post(UpdatedMessage)

module.exports = router