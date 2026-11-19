const express = require("express");
const Sprint = require("../models/Sprint");
const router = express.Router();

router.get("/", async (req, res) => res.json(await Sprint.find()));
router.post("/", async (req, res) => {
  try { res.status(201).json(await Sprint.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;