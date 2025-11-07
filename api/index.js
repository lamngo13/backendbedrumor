// api/index.js
module.exports = (req, res) => {
  const origin = req.headers.origin || '*';
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin === 'null' ? '*' : origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'text/plain' });
    res.end('okay!! from /api/');
    return;
  }

  res.writeHead(405, corsHeaders);
  res.end('Method Not Allowed');
};
