const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend connected successfully!");
});

module.exports = (req, res) => {
  // Let Express handle the request
  app(req, res);
};
