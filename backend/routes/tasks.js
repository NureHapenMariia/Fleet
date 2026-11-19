const express = require("express");
const Task = require("../models/Task");
require("../models/User");
Sprint = require("../models/Sprint");

const router = express.Router();

// список + пошук і фільтри
router.get("/", async (req, res) => {
  try {
    const { q, status, userId, sprintId } = req.query;
    const filter = {};
    if (q) filter.Title = { $regex: q, $options: "i" };
    if (status) filter.Status = status;
    if (userId) filter.UserId = userId;
    if (sprintId) filter.SprintId = sprintId;

    const tasks = await Task.find(filter)
      .populate("UserId", "UserName")
      .populate("SprintId", "Name");
    res.json(tasks);
  } catch (err) {
    console.error(JSON.stringify(err.errInfo, null, 2));
    res.status(500).json({ message: "Server error" });
  }
});

// агрегація: задачі і story points на користувача
router.get("/stats/per-user", async (req, res) => {
  try {
    const data = await Task.aggregate([
      { $group: { _id: "$UserId", tasks: { $sum: 1 }, points: { $sum: "$StoryPoints" } } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { _id: 0, UserName: "$user.UserName", tasks: 1, points: 1 } },
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  const sprint = await Sprint.findById(req.body.SprintId);
  if (!sprint) return res.status(400).json({ message: "Invalid SprintId" });
  if (!sprint.Members.some((m) => m.equals(req.body.UserId))) {
    return res.status(400).json({ message: "User is not a member of the sprint" });
  }
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error(JSON.stringify(err.errInfo, null, 2));
    res.status(400).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: "Not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;