import { put, get } from '@vercel/blob';

const BLOB_FILENAME = 'entries.json';

// Helper to read entries from Vercel Blob
async function readEntries() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.warn('BLOB_READ_WRITE_TOKEN missing, returning empty array');
      return [];
    }

    const blob = await get(BLOB_FILENAME, {
      token: process.env.BLOB_READ_WRITE_TOKEN
    }).catch(() => null);

    if (!blob) return [];

    const text = await blob.text();
    return JSON.parse(text || '[]');
  } catch (err) {
    console.error('Error reading entries:', err);
    return [];
  }
}

// Helper to write entries to Vercel Blob
async function writeEntries(entries) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN is missing');
    }

    const blob = await put(BLOB_FILENAME, JSON.stringify(entries, null, 2), {
      access: 'public',
      contentType: 'application/json',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      allowOverwrite: true,
    });

    console.log('Entries saved to blob:', blob.url);
    return blob;
  } catch (err) {
    console.error('Error writing entries:', err);
    throw err;
  }
}

export default async function handler(req, res) {
  // CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*'; // set your frontend domain in env if needed
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS preflight
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const entries = await readEntries();

    if (req.method === 'GET') {
      return res.status(200).json({ entries });
    }

    if (req.method === 'POST') {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Missing text field' });

      const newEntry = { id: Date.now(), text };
      entries.push(newEntry);

      await writeEntries(entries);

      return res.status(201).json({ success: true, entry: newEntry });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}
