const mongoose = require("mongoose");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");
const mailSender = require("../utils/mailsender");

const OTPschema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,

    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

// Define a function to send emails
async function sendVerificationEmail(email, otp) {
  // Create a transporter to send emails

  // Define the email options

  // Send the email
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email from Educademy",
      emailTemplate(otp)
    );
    console.log("Email sent successfully: ", mailResponse.response);
  } catch (error) {
    console.log("Error occurred while sending email: ", error);
    throw error;
  }
}

// Define a post-save hook to send email after the document has been saved
OTPschema.pre("save", async function (next) {
  console.log("New document saved to database");
  try {
    await sendVerificationEmail(this.email, this.otp);
    next();
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error);
  }
});
module.exports = mongoose.model("OTP", OTPschema);
