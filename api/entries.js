import { put, head } from '@vercel/blob';

const BLOB_FILENAME = 'entries.json';

// Helper to read entries from Vercel Blob
async function readEntries() {
  try {
    // Check if blob exists
    const blobUrl = process.env.BLOB_READ_WRITE_TOKEN 
      ? `https://${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/${BLOB_FILENAME}`
      : null;
    
    if (!blobUrl) return [];
    
    // Try to fetch the blob
    const response = await fetch(blobUrl);
    if (!response.ok) return [];
    
    const data = await response.text();
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading entries:', err);
    return [];
  }
}

// Helper to write entries to Vercel Blob
async function writeEntries(entries) {
  try {
    const blob = await put(BLOB_FILENAME, JSON.stringify(entries, null, 2), {
      access: 'public',
      contentType: 'application/json',
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
    let entries = await readEntries();

    if (req.method === 'GET') {
      return res.status(200).json({ entries });
    }

    if (req.method === 'POST') {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: 'Missing text field' });

      const id = Date.now();
      const newEntry = { id, text };
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
