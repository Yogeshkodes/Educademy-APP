const Razorpay = require("razorpay");

exports.instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

console.log("Razorpay Config:", {
  key_id: process.env.RAZORPAY_KEY,
  // Don't log the secret key in production
});
