const mongoose = require("mongoose");
const SubSection = require("./subSection");

const SectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
  },
  SubSection: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Subsection",
    },
  ],
});

module.exports = mongoose.model("Section", SectionSchema);
