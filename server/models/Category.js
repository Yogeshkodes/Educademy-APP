const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  course: [
    {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Course",
    },
  ],
  description: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Category", categorySchema);
