import express from "express";

const app = express();

// Middleware to parse JSON (optional, but useful if your frontend sends JSON)
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Hello from Node.js on Vercel!");
});

// Example API route
app.get("/api/data", (req, res) => {
  res.json({ message: "This is some data from your API!" });
});

// Example POST route
app.post("/api/echo", (req, res) => {
  // Echo back JSON sent from frontend
  res.json({ received: req.body });
});

// Export the app as a Vercel serverless function
export default app;
