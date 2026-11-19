const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.get("/", async (req, res) => res.json(await User.find({}, "UserName")));

module.exports = router;