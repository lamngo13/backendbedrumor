const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS so you can call this API from any frontend
app.use(cors());

// Example API 1
app.get('/api/hello', (req, res) => {
  res.send('Hello from Express!');
});

// Example API 2
app.get('/api/goodbye', (req, res) => {
  res.send('Goodbye from Express!');
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to my backend!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
