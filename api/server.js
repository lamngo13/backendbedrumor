const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Use CORS for all routes
app.use(cors());
app.use(express.json());

// ✅ Explicitly handle preflight (important for Vercel)
app.options("*", cors());

// ✅ Your normal routes
app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // just to be sure
  res.send("Backend connected successfully!");
});

module.exports = app;
