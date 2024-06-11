const User = require("../models/User");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
require("dotenv").config();
const mailSender = require("../utils/mailsender");
// Send OTP

exports.sendOtp = async (req, res) => {
  try {
    // Fetch the email from body

    const { email } = req.body;

    // Check in Database
    const checkUser = await User.findOne({ email });

    //if user already exist then return fn...
    if (checkUser) {
      return res.status(401).json({
        success: false,
        message: "Email/User already registerd",
      });
    }

    //if user don't exist generate otp

    let otp = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    //create an entry for otp

    const otpBody = await OTP.create(otpPayload);

    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Signup

exports.signUp = async (req, res) => {
  try {
    // Fetch krlo
    const {
      firstname,
      lastname,
      password,
      otp,
      email,
      accountType,
      confirmPassword,
      contactNumber,
    } = req.body;

    // Validate krlo

    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    )
      return res.status(403).json({
        success: false,
        message: "Please fill the required fields",
      });

    //Check user already exist

    const existuser = await User.findOne({ email });
    if (existuser)
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });

    //find most recend otp stored for the user

    const recentotp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (recentotp.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP NOT FOUND",
      });
    } else if (otp !== recentotp.otp) {
      return res.status(400).json({
        success: false,
        message: "INVALID OTP",
      });
    }

    // HAsh PASSWORD

    const hashedPassword = await bcrypt.hash(password, 10);

    // CREATE ENTRY IN DB

    const user = await User.create({
      firstname,
      lastname,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastname}`,
    });

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
};

// Login Controller handler

exports.login = async (req, res) => {
  try {
    // Fetch from body
    const { email, password } = req.body;

    // Validating fields are not empty
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Please fill required fields",
      });
    }

    // User exist or not in DB

    const user = await User.findOne({ email }).populate("additionalDetails");

    if (!existUser) {
      return res.status(403).json({
        success: false,
        message: "User does not exist, Plase Sign Up first",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        role: user.role,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      user.token = token;
      user.password = undefined;

      //create cookie ande send response

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in Succesfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be Login. Please try again.",
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    // Get the data from the request body
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    // Check if new password and confirmation match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match",
      });
    }

    // Find the user and verify the old password
    const user = await User.findOne({ email: req.user.email });
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    const updatedUser = await User.findOneAndUpdate(
      { email: req.user.email },
      { password: hashedPassword },
      { new: true }
    );

    // Send a notification email
    await mailSender(
      updatedUser.email,
      "Password Changed Successfully",
      "Your password has been changed."
    );

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while changing the password",
    });
  }
};
