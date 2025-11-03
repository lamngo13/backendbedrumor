import express from "express";
import cors from "cors"; // import the CORS middleware

const app = express();

// Enable CORS for all origins (or you can restrict to your frontend URL)
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Hello from Node.js on Vercel!");
});

// Example GET API route
app.get("/api/data", (req, res) => {
  res.json({ message: "This is some data from your API!" });
});

// Example POST API route
app.post("/api/echo", (req, res) => {
  res.json({ received: req.body });
});

export default app;
