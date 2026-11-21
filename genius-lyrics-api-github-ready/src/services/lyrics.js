import { searchGenius, scrapeGeniusPage } from './genius.js';
import { findLrclibLyrics } from './lrclib.js';

function providerError(error) {
  const httpStatus = error?.response?.status || error?.status || null;
  return {
    status: httpStatus === 403 ? 'blocked' : 'error',
    httpStatus,
    message: httpStatus === 403
      ? 'Genius returned HTTP 403. Its server refused this request.'
      : (error?.message || 'Provider request failed.')
  };
}

export async function getLyrics({ title, artist = '' }) {
  const providers = {
    genius: {
      search: { status: 'not_started' },
      lyrics: { status: 'not_started' }
    },
    lrclib: { lyrics: { status: 'not_started' } }
  };

  let matches = [];
  try {
    matches = await searchGenius([artist, title].filter(Boolean).join(' '));
    providers.genius.search = {
      status: matches.length ? 'success' : 'no_match',
      resultCount: matches.length
    };
  } catch (error) {
    providers.genius.search = providerError(error);
  }

  const match = matches[0] || null;
  let lrclib = null;
  try {
    lrclib = await findLrclibLyrics(title, artist);
    providers.lrclib.lyrics = lrclib
      ? { status: lrclib.plainLyrics || lrclib.syncedLyrics?.length ? 'success' : 'no_lyrics' }
      : { status: 'no_match' };
  } catch (error) {
    providers.lrclib.lyrics = providerError(error);
  }

  let geniusLyrics = null;
  if (match?.url) {
    try {
      geniusLyrics = await scrapeGeniusPage(match.url);
      providers.genius.lyrics = geniusLyrics?.lyrics
        ? { status: 'success' }
        : { status: 'no_lyrics' };
    } catch (error) {
      providers.genius.lyrics = providerError(error);
    }
  } else if (providers.genius.search.status === 'blocked' || providers.genius.search.status === 'error') {
    providers.genius.lyrics = { status: 'not_attempted', reason: 'Genius song search did not return a page URL.' };
  } else {
    providers.genius.lyrics = { status: 'not_attempted', reason: 'No Genius song match was found.' };
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
    },
    providerStatus: providers
  };
}
