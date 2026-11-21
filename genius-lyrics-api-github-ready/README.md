# Genius Lyrics API

A Node.js/Express API for song discovery and lyrics metadata. It accepts song names, artist names, natural-language requests, or YouTube video links. Genius is used for song discovery; LRCLIB is queried for lyrics and synchronized lyric data when available.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000/health`.

## Endpoints

- `GET /` — API information and examples
- `GET /health` — health check
- `GET /search?q=artist%20song` — search Genius
- `GET /lyrics?q=Blinding%20Lights%20by%20The%20Weeknd` — flexible text lookup
- `GET /lyrics?q=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DVIDEO_ID` — lookup from YouTube video metadata
- `GET /lyrics?title=Blinding%20Lights&artist=The%20Weeknd` — explicit fields
- `POST /lyrics` — flexible JSON lookup
- `POST /scrape` — attempt to read a publicly accessible Genius song URL

### Example requests

Natural language:

```bash
curl --get "https://YOUR-API.onrender.com/lyrics" --data-urlencode "q=Can you get the lyrics to Blinding Lights by The Weeknd?"
```

YouTube link:

```bash
curl --get "https://YOUR-API.onrender.com/lyrics" --data-urlencode "q=https://www.youtube.com/watch?v=VIDEO_ID"
```

JSON body:

```bash
curl -X POST "https://YOUR-API.onrender.com/lyrics" \
  -H "Content-Type: application/json" \
  -d '{"input":"Blinding Lights by The Weeknd"}'
```

Explicit title and artist:

```bash
curl -X POST "https://YOUR-API.onrender.com/lyrics" \
  -H "Content-Type: application/json" \
  -d '{"title":"Blinding Lights","artist":"The Weeknd"}'
```

YouTube support uses YouTube's public oEmbed metadata (video title and channel name) to infer the track. It does not download audio or identify songs from the sound itself. If the video title is ambiguous, pass the title and artist directly.

## Configuration

- `GENIUS_ACCESS_TOKEN`: optional Genius API access token. Recommended for search.
- `GENIUS_SCRAPE_ENABLED`: set to `false` to disable Genius page reading.
- `PROXY_URL`: optional shared HTTP(S) or SOCKS proxy.
- `GENIUS_PROXY_URL`, `LRCLIB_PROXY_URL`: optional provider-specific proxy overrides.

## Notes

Lyrics availability and synchronization depend on upstream providers. Word-level timestamps are returned only if a provider supplies them; this API does not invent timing data. Genius page structure and public endpoints can change. Respect Genius and LRCLIB terms, copyright, robots/access restrictions, and any permissions that apply to your use. This project does not bypass logins, bot protections, paywalls, or other access controls.

For Render, set the Root Directory to `genius-lyrics-api-github-ready`, Build Command to `npm install`, and Start Command to `npm start`.
