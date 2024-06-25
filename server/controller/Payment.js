const { instance } = require("../config/razorpay");
const User = require("../models/User");
const Course = require("../models/Courses");
const mailSender = require("../utils/mailSender");

exports.capturePayment = async (req, res) => {
  // get courseID and UserID

  const { course_id } = req.body;
  const userID = req.user.id;

  //validation

  if (!course_id) {
    return res.json({
      success: false,
      message: "Please send valid course Id",
    });
  }
  let course;
  try {
    course = await Course.findById(course_id);
    if (!course) {
      return res.json({
        success: false,
        message: "Could not find course",
      });
    }

    //if course id present then check if user already baought it or not
    const uid = new mongoose.Types.ObjectId(userID);
    if (course.studentsEnrolled.includes(uid)) {
      return res.status(200).json({
        success: false,
        message: "You have already bought this course",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
    note: {
      couserID: course_id,
      userID,
    },
  };

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options);
    console.log(paymentResponse);
    res.status(200).json({
      success: true,
      courseName: course.courseName,
      courseDescription: course.courseDescription,
      thumbnail: course.thumbnail,
      orderID: paymentResponse.id,
      currency: paymentResponse.currency,
      amount: paymentResponse.amount,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." });
  }
};
