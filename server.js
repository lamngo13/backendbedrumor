const express = require("express");
const cors = require("cors");

const app = express();

// ✅ Allow any origin, any method, any headers
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["*"],
}));

// Handle preflight requests explicitly
app.options("*", cors());

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Backend connected successfully!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
