import { makeClient } from '../http.js';
import { config } from '../config.js';
import { parseLrc, parseWordSyncedLines } from '../utils.js';

const http = makeClient(config.lrclibProxyUrl);
const base = 'https://lrclib.net/api';

export async function findLrclibLyrics(title, artist = '') {
  try {
    const { data } = await http.get(`${base}/get`, { params: { track_name: title, artist_name: artist } });
    if (data) return normalize(data);
  } catch {}

  const { data } = await http.get(`${base}/search`, { params: { track_name: title, artist_name: artist } });
  if (!Array.isArray(data) || !data.length) return null;
  const normalizedTitle = title.toLowerCase();
  const normalizedArtist = artist.toLowerCase();
  const best = data.find(item =>
    String(item.trackName || '').toLowerCase() === normalizedTitle &&
    (!normalizedArtist || String(item.artistName || '').toLowerCase() === normalizedArtist)
  ) || data[0];
  return normalize(best);
}

function normalize(item) {
  const syncedLyrics = item.syncedLyrics || '';
  return {
    plainLyrics: item.plainLyrics || null,
    syncedLyrics: syncedLyrics ? parseLrc(syncedLyrics) : [],
    wordSyncedLyrics: parseWordSyncedLines(item.lines || []),
    album: item.albumName || null,
    releaseDate: item.releaseDate || null,
    duration: item.duration || null,
    source: 'lrclib'
  };
}
