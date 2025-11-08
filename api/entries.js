import { put, get } from '@vercel/blob';

const BLOB_FILENAME = 'entries1.json';

// Always allow CORS
function enableCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Read the JSON dictionary from Blob (or create empty)
async function readEntries() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.warn('⚠️ Missing BLOB_READ_WRITE_TOKEN');
      return {};
    }

    const blob = await get(BLOB_FILENAME, { token }).catch(() => null);
    if (!blob) return {};

    const text = await blob.text();
    return JSON.parse(text || '{}');
  } catch (err) {
    console.error('❌ Error reading blob:', err);
    return {};
  }
}

// Write dictionary back to Blob
async function writeEntries(entries) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('Missing BLOB_READ_WRITE_TOKEN');

  await put(BLOB_FILENAME, JSON.stringify(entries, null, 2), {
    access: 'public',
    token,
    contentType: 'application/json',
  });
}

export default async function handler(req, res) {
  enableCORS(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const entries = await readEntries();
      return res.status(200).json(entries);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to read entries', details: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Missing text field' });

      const entries = await readEntries();

      // find next numeric key
      const keys = Object.keys(entries).map(k => parseInt(k, 10)).filter(n => !isNaN(n));
      const nextKey = keys.length ? Math.max(...keys) + 1 : 1;

      entries[nextKey] = text;

      await writeEntries(entries);

      return res.status(201).json({ success: true, entry: { id: nextKey, text } });
    } catch (err) {
      console.error('❌ POST error:', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
