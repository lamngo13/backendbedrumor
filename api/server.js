const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ✅ Explicit preflight handler
app.options("*", cors());

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Backend connected successfully!");
});

app.get("/test", (req, res) => {
  res.send("Test backend connected successfully!");
});

module.exports = app;
