const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true
    },
    Goal: {
      type: String,
      required: true    
    },
    StartDate: {
      type: Date,
      required: true    
    },
    EndDate: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);