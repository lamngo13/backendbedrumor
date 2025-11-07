import { get, set } from '@vercel/edge-config';

const EDGE_KEY = 'entries';

// Helper to read entries from Edge Config
async function readEntries() {
  try {
    const data = await get(EDGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading entries from Edge Config:', err);
    return [];
  }
}

// Helper to write entries to Edge Config
async function writeEntries(entries) {
  try {
    await set(EDGE_KEY, JSON.stringify(entries));
    console.log('Entries saved to Edge Config');
  } catch (err) {
    console.error('Error writing entries to Edge Config:', err);
    throw err;
  }
}

// Edge function handler
export const config = {
  runtime: 'edge', // required for edge config
};

export default async function handler(req) {
  const allowedOrigin = '*'; // set your frontend domain if you want, e.g., 'https://bedrumor.com'

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    let entries = await readEntries();

    if (req.method === 'GET') {
      return new Response(JSON.stringify({ entries }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': allowedOrigin,
        },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { text } = body;
      if (!text) {
        return new Response(JSON.stringify({ error: 'Missing text field' }), {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
        });
      }

      const newEntry = { id: Date.now(), text };
      entries.push(newEntry);
      await writeEntries(entries);

      return new Response(JSON.stringify({ success: true, entry: newEntry }), {
        status: 201,
        headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ error: 'Server error', details: err.message }), {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': allowedOrigin, 'Content-Type': 'application/json' },
    });
  }
}
