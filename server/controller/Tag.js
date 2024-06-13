const Tag = require("../models/tags");

exports.createTag = async (req, res) => {
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

    const tagDetails = await Tag.create({
      name: name,
      description: description,
    });

    console.log(tagDetails);

    return res.status(200).json({
      success: true,
      message: "Tags created succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create handler to see for all tags

exports.showAlltags = async (req, res) => {
  try {
    const allTags = await Tag.find({}, { name: true, description: true });

    res.status(200).json({
      success: true,
      message: "AllTags returned succesfully",
      allTags,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
