const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true
    },
    Text: {
        type: String,
        required: true
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    SprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sprint",
        required: true
    },
    Status: {
        type: String,
        enum: ["todo", "in-progress", "done"],
        default: "todo"
    },
    StoryPoints: {
        type: Number,
        required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("task", taskSchema);