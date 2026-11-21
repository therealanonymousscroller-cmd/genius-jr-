import { searchGenius, scrapeGeniusPage } from './genius.js';
import { findLrclibLyrics } from './lrclib.js';

export async function getLyrics({ title, artist = '' }) {
  const matches = await searchGenius([artist, title].filter(Boolean).join(' '));
  const match = matches[0] || null;
  let lrclib = null;
  try { lrclib = await findLrclibLyrics(title, artist); } catch {}

  let geniusLyrics = null;
  if (match?.url) {
    try { geniusLyrics = await scrapeGeniusPage(match.url); } catch {}
  }

  const plainLyrics = lrclib?.plainLyrics || geniusLyrics?.lyrics || null;
  return {
    title: match?.title || title,
    artist: match?.artist || artist,
    album: lrclib?.album || match?.album || null,
    releaseDate: lrclib?.releaseDate || match?.releaseDate || null,
    geniusUrl: match?.url || null,
    duration: lrclib?.duration || null,
    lyrics: plainLyrics,
    syncedLyrics: lrclib?.syncedLyrics || [],
    wordSyncedLyrics: lrclib?.wordSyncedLyrics || [],
    sources: {
      lyrics: lrclib?.plainLyrics ? 'lrclib' : (geniusLyrics?.lyrics ? 'genius' : null),
      syncedLyrics: lrclib?.syncedLyrics?.length ? 'lrclib' : null
    }
  };
}
