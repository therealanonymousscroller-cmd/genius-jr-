import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { searchGenius, scrapeGeniusPage } from './services/genius.js';
import { getLyrics } from './services/lyrics.js';
import { resolveSongInput } from './services/input.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/', (_req, res) => res.json({
  name: 'Genius Lyrics API',
  status: 'running',
  examples: {
    text: '/lyrics?q=Blinding%20Lights%20by%20The%20Weeknd',
    youtube: '/lyrics?q=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DVIDEO_ID',
    post: 'POST /lyrics with JSON { "input": "Song title by Artist" }'
  },
  endpoints: ['/health', '/search?q=artist%20song', '/lyrics?q=... or ?title=...&artist=...', 'POST /lyrics', 'POST /scrape']
}));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.get('/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing required query parameter: q' });
  try {
    res.json({ query: q, results: await searchGenius(q) });
  } catch (error) {
    res.status(502).json({ error: 'Genius search failed', details: error.message });
  }
});

async function lyricsHandler(input, title, artist, res) {
  try {
    const resolved = title
      ? { title: String(title).trim(), artist: String(artist || '').trim(), inputType: 'fields' }
      : await resolveSongInput(input);
    if (!resolved.title) return res.status(400).json({ error: 'Could not identify a song title.' });
    const result = await getLyrics({ title: resolved.title, artist: resolved.artist });
    return res.json({
      input: { type: resolved.inputType, original: input || null },
      identification: { title: resolved.title, artist: resolved.artist || null, videoTitle: resolved.videoTitle || null, channel: resolved.channel || null },
      ...result
    });
  } catch (error) {
    const status = /provide a song|identify a song/i.test(error.message) ? 400 : 502;
    return res.status(status).json({ error: 'Could not process song input', details: error.message });
  }
}

app.get('/lyrics', (req, res) => {
  const title = String(req.query.title || '').trim();
  const artist = String(req.query.artist || '').trim();
  const q = String(req.query.q || '').trim();
  if (!title && !q) return res.status(400).json({ error: 'Provide q, or title (and optionally artist).' });
  return lyricsHandler(q, title, artist, res);
});

app.post('/lyrics', (req, res) => {
  const input = String(req.body?.input || req.body?.query || req.body?.url || '').trim();
  const title = String(req.body?.title || '').trim();
  const artist = String(req.body?.artist || '').trim();
  if (!input && !title) return res.status(400).json({ error: 'Provide input, query, url, or title in the JSON body.' });
  return lyricsHandler(input, title, artist, res);
});

app.post('/scrape', async (req, res) => {
  const url = String(req.body?.url || '').trim();
  if (!url) return res.status(400).json({ error: 'JSON body must include a url field' });
  try {
    res.json(await scrapeGeniusPage(url));
  } catch (error) {
    res.status(502).json({ error: 'Genius page read failed', details: error.message });
  }
});

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Genius Lyrics API listening on port ${config.port}`);
});
