# Genius Lyrics API

A small Node.js/Express API. Genius is used for song discovery; LRCLIB is queried for lyrics and synchronized lyric data when available. The API may attempt to read publicly accessible Genius lyric pages if enabled.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000/health`.

## Endpoints

- `GET /` — API information
- `GET /health` — health check
- `GET /search?q=artist%20song` — search Genius
- `GET /lyrics?title=Song%20Title&artist=Artist` — find lyrics and metadata
- `POST /scrape` — attempt to read a publicly accessible Genius song URL; JSON body: `{ "url": "https://genius.com/..." }`

## Configuration

- `GENIUS_ACCESS_TOKEN`: optional Genius API access token. Recommended for search.
- `GENIUS_SCRAPE_ENABLED`: set to `false` to disable Genius page reading.
- `PROXY_URL`: optional shared HTTP(S) or SOCKS proxy.
- `GENIUS_PROXY_URL`, `LRCLIB_PROXY_URL`: optional provider-specific proxy overrides.

## Notes

Lyrics availability and synchronization depend on the upstream providers. Word-level timestamps are returned only if the provider supplies them; this API does not invent timing data. Genius page structure and public endpoints can change. Respect Genius and LRCLIB terms, copyright, robots/access restrictions, and any permissions that apply to your use. This project does not bypass logins, bot protections, paywalls, or other access controls.

For Railway, the repository root must contain `package.json`. Railway should detect Node.js and use `npm start`.
