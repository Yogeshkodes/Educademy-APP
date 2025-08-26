const User = require("../models/User");
const bcrypt = require("bcrypt");
const mailSender = require("../utils/mailsender");

exports.resetPasswordToken = async (req, res) => {
  try {
    // fetch krliya email

    const { email } = req.body;

    //chcek email validation

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Please register your email first...",
      });
    }

    // when user email is there create token and update in db

    const token = crypto.randomUUID();

    const UpdateDetails = await User.findOneAndUpdate(
      { email },
      {
        token: token,
        resetPasswordexpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );

    //creaete url

    const url = `https://localhost:3000/update-password/${token}`;

    //send mail containing the url

    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: ${url} `
    );

    return res.json({
      token: token,
      success: true,
      message: "Email sent succesfully, please check email and change password",
    });
  } catch (error) {
    console.log(error);
    return res.staus(401).json({
      success: false,
      message: "Something wrong with sending email , Please try again",
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (confirmPassword !== password) {
      return res.json({
        success: false,
        message: "Password and Confirm Password Does not Match",
      });
    }
    const userDetails = await User.findOne({ token: token });
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      });
    }
    if (!(userDetails.resetPasswordexpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: `Token is Expired, Please Regenerate Your Token`,
      });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      { token: token },
      { password: encryptedPassword },
      { new: true }
    );
    res.json({
      success: true,
      message: `Password Reset Successful`,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      success: false,
      message: `Some Error in Updating the Password`,
    });
  }
};
