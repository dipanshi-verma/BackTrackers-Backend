// server.js
const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middleware for JSON parsing
app.use(express.json());

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

// Test Route
app.get("/api/test", (req, res) => {
  res.json({ message: "✅ Server & Database are working fine!" });
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
