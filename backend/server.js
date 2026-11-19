require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use("/api/sprints", require("./routes/sprints"));
app.use("/api/users", require("./routes/users"));
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const taskRoutes = require("./routes/tasks");
app.use("/api/tasks", taskRoutes);

// Connect to MongoDB
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
  });