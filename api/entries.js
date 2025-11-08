import { put, get } from '@vercel/blob';



let entries = []; // in-memory array, resets on redeploy

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ entries });
  }

  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Missing text field' });

      const id = Date.now(); // simple unique id
      entries.push({ id, text });

      return res.status(201).json({ success: true, entry: { id, text } });
    } catch (err) {
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
