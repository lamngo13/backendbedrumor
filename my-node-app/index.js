import express from "express";
import cors from "cors";

const app = express();

// Allow all origins (dev only)
app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello from Node.js on Render!");
});

app.get("/api/data", (req, res) => {
  res.json({ message: "This is public data!" });
});

app.post("/api/echo", (req, res) => {
  res.json({ received: req.body });
});

// Listen on the port Render provides or default 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
