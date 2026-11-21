import { searchGenius, scrapeGeniusPage } from './genius.js';
import { findLrclibLyrics } from './lrclib.js';

export async function getLyrics({ title, artist = '' }) {
  // Treat each provider as optional: a Genius 403 should not prevent
  // trying LRCLIB, which may still have the lyrics.
  let matches = [];
  try {
    matches = await searchGenius([artist, title].filter(Boolean).join(' '));
  } catch {
    // Genius may refuse automated requests; continue with LRCLIB.
  }

  const match = matches[0] || null;
  let lrclib = null;
  try {
    lrclib = await findLrclibLyrics(title, artist);
  } catch {
    // Keep any Genius result if LRCLIB is unavailable.
  }

  let geniusLyrics = null;
  if (match?.url) {
    try {
      geniusLyrics = await scrapeGeniusPage(match.url);
    } catch {
      // A page-level Genius 403 should not discard LRCLIB results.
    }
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
