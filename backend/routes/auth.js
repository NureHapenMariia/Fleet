const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { UserName, Password } = req.body;

    if (!UserName || !Password) {
      return res.status(400).json({ message: "UserName and Password are required" });
    }

    const exists = await User.findOne({ UserName });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hash = await bcrypt.hash(Password, 10);
    const user = await User.create({ UserName, Password: hash });

    res.status(201).json({ id: user._id, UserName: user.UserName });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { UserName, Password } = req.body;

    if (!UserName || !Password) {
      return res.status(400).json({ message: "UserName and Password are required" });
    }

    const user = await User.findOne({ UserName });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }   

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router