// api/test.js
// Minimal Vercel Serverless Function (CommonJS) that handles preflight + GET
module.exports = (req, res) => {
  const origin = req.headers.origin || '*';

  const corsHeaders = {
    // echo origin if present so credentials could be supported later if needed
    'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };

  // Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // GET handler
  if (req.method === 'GET') {
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'text/plain' });
    res.end('okay from api test!!!');
    return;
  }

  // Fallback
  res.writeHead(405, corsHeaders);
  res.end('Method Not Allowed');
};
