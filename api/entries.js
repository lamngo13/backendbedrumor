import fs from 'fs';
import path from 'path';

const FILE_PATH = path.join('/tmp', 'entries.json');

// Helper to read entries
function readEntries() {
  try {
    if (!fs.existsSync(FILE_PATH)) return [];
    const data = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading entries:', err);
    return [];
  }
}

// Helper to write entries
function writeEntries(entries) {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(entries, null, 2));
  } catch (err) {
    console.error('Error writing entries:', err);
  }
}

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  let entries = readEntries();

  if (req.method === 'GET') {
    return res.status(200).json({ entries });
  }

  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Missing text field' });

      const id = Date.now();
      const newEntry = { id, text };
      entries.push(newEntry);
      writeEntries(entries);

      return res.status(201).json({ success: true, entry: newEntry });
    } catch (err) {
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
