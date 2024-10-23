const { default: mongoose } = require("mongoose");
const FAQ = require("../../../model/Faq-model");

const seeQustion = async(req,res) => {
    try {
        // const faqQustions =  await FAQ.find().populate('user_id')
        const faqQustions =  await FAQ.aggregate([
            {
                $lookup:{
                    from:'users',
                    localField:'user_id',
                    foreignField:'_id',
                    as:'userDetails'

                }
            },
            {
                $unwind:{
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true
                }
            }
        ])

       
      
        res.render("Layout", { body: "FAQ/Qustions",data:faqQustions });
    } catch (error) {
        console.log(error,"error while viewing qustions");
    }
}

const toAnswer = async(req,res) => {
    try {
        // const toanswer =  await FAQ.findOne({_id:req.params.id,isAnswered:false}).populate('user_id')
        const toanswer =  await FAQ.aggregate([{$match:{_id:new mongoose.Types.ObjectId(req.params.id)}},{
            $lookup:{
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'result'
            }
        },
        {
        $unwind:{
            path: "$result",
             preserveNullAndEmptyArrays: true
        }
    }
    ])
       
        res.render("Layout", { body: "FAQ/Answer",data:toanswer[0] });
    } catch (error) {
        console.log(error,"error while viewing answer page");
    }

   
}

const answerOfQustion = async(req,res) => {
    try {
        const {answer} = req.body
        // console.log(answer);
          await FAQ.findByIdAndUpdate({_id:req.params.id,isAnswered:false},{answer:answer,isAnswered:true})
        //   await FAQ.aggregate([{$match:{_id:new mongoose.Types.ObjectId(req.params.id),isAnswered:false}},
        //     {$set:{answer:answer,isAnswered:true}}
        //   ])
    
        res.redirect("/admin/user/faq/questions")
    } catch (error) {
        console.log(error,"error while giving  answer of qustion");
    }
}

const deleteAnswer = async(req,res) => {
    try {
        await FAQ.findByIdAndUpdate({_id:req.params.id},{answer:""})
        console.log("Answer Delete Success");
        res.redirect("/admin/user/faq/questions")
    } catch (error) {
        console.log(error);
    }
}

const updateAnswer = async(req,res) => {
    try {
        // const faqQustions =  await FAQ.findOne({_id:req.params.id})
        const faqQustions =  await FAQ.aggregate([{$match:{_id:new mongoose.Types.ObjectId(req.params.id)}}])
  
        res.render("Layout", { body: "FAQ/Update",data:faqQustions[0] });
    } catch (error) {
        console.log(error,"error while viewing qustions");
    }
}

const UpdatedMessage = async(req,res) => {
      const {answer} = req.body
      console.log(answer);
      await FAQ.findOneAndUpdate({_id:req.params.id},{answer:answer})
      res.redirect("/admin/user/faq/questions")
}

module.exports = {seeQustion,toAnswer,answerOfQustion,deleteAnswer,updateAnswer,UpdatedMessage}