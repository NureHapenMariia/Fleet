const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    Password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);