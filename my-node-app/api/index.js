import express from "express";
import cors from "cors";
import serverless from "serverless-http"; // 👈 add this

const app = express();

// Handle preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  return res.sendStatus(200);
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Node.js on Vercel!");
});

app.get("/api/data", (req, res) => {
  console.log("GET /api/data hit");
  res.json({ message: "This is some data from your API!" });
});

app.post("/api/echo", (req, res) => {
  res.json({ received: req.body });
});

// 👇 THIS is the key change:
export const handler = serverless(app);
export default handler;
