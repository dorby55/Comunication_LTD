// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

// Routes
const authRoutes = require("./routes/auth");
const customerRoutes = require("./routes/customers");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test DB connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection error:", err);
  } else {
    console.log("Database connected successfully");
    connection.release();
  }
});

// Routes
app.use("/api", authRoutes);
app.use("/api", customerRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Communication_LTD API is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
