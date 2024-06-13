const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    //data fetch krlo

    const { name, description } = req.body;

    ///validate krlo
    if (!name || !description) {
      return res.status(401).json({
        success: false,
        message: "Required all the fields",
      });
    }

    // Present hai toh db me store krlo

    const categoryDetails = await Category.create({
      name: name,
      description: description,
    });

    console.log(categoryDetailsDetails);

    return res.status(200).json({
      success: true,
      message: "Categories created succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create handler to see for all category

exports.showAllcategory = async (req, res) => {
  try {
    const allCategory = await Category.find({}, { name: true, description: true });

    res.status(200).json({
      success: true,
      message: "allCategory returned succesfully",
      allCategory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
