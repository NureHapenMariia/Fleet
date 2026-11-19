const express = require("express");
const Sprint = require("../models/Sprint");
require("../models/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    console.log("GET /api/sprints");
    const sprints = await Sprint.find().populate("Members", "UserName");
    res.json(sprints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const sprint = await Sprint.create(req.body);
    res.status(201).json(sprint);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.post("/:id/members", async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { Members: req.body.userId } },
      { new: true }
    ).populate("Members", "UserName");
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

router.delete("/:id/members/:userId", async (req, res) => {
  try {
    const sprint = await Sprint.findByIdAndUpdate(
      req.params.id,
      { $pull: { Members: req.params.userId } },
      { new: true }
    ).populate("Members", "UserName");
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });
    res.json(sprint);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;