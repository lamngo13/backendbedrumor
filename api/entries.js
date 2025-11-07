import { put, head } from '@vercel/blob';

const BLOB_FILENAME = 'entries.json';

// Helper to read entries from Vercel Blob
async function readEntries() {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN || !process.env.BLOB_STORE_ID) {
      console.warn('BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID missing, returning empty array');
      return [];
    }

    const blobUrl = `https://${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/${BLOB_FILENAME}`;

    // Check if blob exists
    const exists = await head(BLOB_FILENAME, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }).catch(() => null);

    if (!exists) return []; // blob doesn't exist yet

    // Fetch the blob contents
    const response = await fetch(blobUrl);
    if (!response.ok) return [];
    const text = await response.text();
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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

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
