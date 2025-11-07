// api/test.js
module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all origins
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET request
  if (req.method === 'GET') {
    res.status(200).send('ok from /api/test');
    return;
  }

  res.status(405).send('Method Not Allowed');
};
