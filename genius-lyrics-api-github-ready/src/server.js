import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { searchGenius, scrapeGeniusPage } from './services/genius.js';
import { getLyrics } from './services/lyrics.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/', (_req, res) => res.json({
  name: 'Genius Lyrics API',
  status: 'running',
  endpoints: ['/health', '/search?q=artist%20song', '/lyrics?title=song&artist=artist', 'POST /scrape']
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

app.get('/lyrics', async (req, res) => {
  const title = String(req.query.title || '').trim();
  const artist = String(req.query.artist || '').trim();
  if (!title) return res.status(400).json({ error: 'Missing required query parameter: title' });
  try {
    const result = await getLyrics({ title, artist });
    res.json(result);
  } catch (error) {
    res.status(502).json({ error: 'Could not retrieve song data', details: error.message });
  }
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
