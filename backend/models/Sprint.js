const mongoose = require("mongoose");

const sprintSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Goal: { type: String },
    StartDate: { type: Date, required: true },
    EndDate: { type: Date, required: true },
    Members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sprint", sprintSchema);