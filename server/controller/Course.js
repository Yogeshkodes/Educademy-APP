// const uploadImagetoCloudinary = require("../utils/imageuploader");
const { uploadImagetoCloudinary } = require("../utils/imageuploader");
const Tag = require("../models/tags");
const User = require("../models/User");
const Course = require("../models/Courses");
require("dotenv").config();

exports.createCourse = async (req, res) => {
  try {
    //fetch kralo data

    const { courseName, courseDescription, whatYouWillLearn, price, tag } =
      req.body;

    const thumbnail = req.files.thumbnailImage;
    // validate kralo

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill the required fields",
      });
    }

    //check for instructor
    const user = req.user.id;

    const instructorDetails = await User.findById(user);

    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor Details not found",
      });
    }

    // Tag valdiate

    const tagDetails = await Tag.findById(tag);
    if (!tagDetails) {
      return res.status(400).json({
        success: false,
        message: "Tag Details not found",
      });
    }

    //upload image to cloudinary

    const thumbnailImage = await uploadImagetoCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    // Create a new course with the given details
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions,
    });

    // Add the new course to the User Schema of the Instructor
    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    //Update tag schema
    // Update the Tag schema with the new course
    await Tag.findByIdAndUpdate(
      tag,
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    // return response

    return res.status(200).json({
      success: true,
      message: "Course created succesfully",
      data: newCourse,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create new course",
      error: error.message,
    });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        thumbnail: true,
        instructor: true,
        ratingAndReviews: true,
        studentsEnroled: true,
      }
    )
      .populate("instructor")
      .exec();
    return res.status(200).json({
      success: true,
      data: allCourses,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({
      success: false,
      message: `Can't Fetch Course Data`,
      error: error.message,
    });
  }
};
