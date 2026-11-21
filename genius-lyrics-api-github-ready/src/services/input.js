import axios from 'axios';

const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']);

function youtubeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && YT_HOSTS.has(url.hostname) &&
      (url.hostname === 'youtu.be' ? url.pathname.length > 1 : url.pathname.startsWith('/watch') || url.pathname.startsWith('/shorts/') || url.pathname.startsWith('/embed/'));
  } catch { return false; }
}

function cleanPhrase(value) {
  return value
    .replace(/^\s*(?:please\s+)?(?:find|get|fetch|show|play)?\s*(?:me\s+)?(?:the\s+)?(?:lyrics|words|song|track)\s*(?:for|of|to)?\s*/i, '')
    .replace(/[“”"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitTitleArtist(value, channel = '') {
  let text = cleanPhrase(value)
    .replace(/\s*\((?:official\s*)?(?:music\s*)?video\)\s*/ig, ' ')
    .replace(/\s*\[(?:official\s*)?(?:music\s*)?(?:video|audio|lyrics?)\]\s*/ig, ' ')
    .replace(/\s*\((?:official\s*)?(?:audio|lyrics?|visualizer|lyric video)\)\s*/ig, ' ')
    .replace(/\s*[-|]\s*(?:official\s*)?(?:music\s*)?(?:video|audio|lyrics?|visualizer).*$/i, '')
    .trim();

  const by = text.match(/^(.+?)\s+by\s+(.+)$/i);
  if (by) return { title: by[1].trim(), artist: by[2].trim() };

  const dash = text.match(/^(.+?)\s+[-–—|]\s+(.+)$/);
  if (dash) return { title: dash[2].trim(), artist: dash[1].trim() };

  const cleanedChannel = String(channel || '').replace(/\s*(?:- topic| official| records| music)$/i, '').trim();
  return { title: text, artist: cleanedChannel };
}

export async function resolveSongInput(input) {
  const value = String(input || '').trim();
  if (!value) throw new Error('Provide a song title and artist, a natural-language request, or a YouTube link.');

  if (youtubeUrl(value)) {
    const endpoint = 'https://www.youtube.com/oembed';
    const { data } = await axios.get(endpoint, {
      params: { url: value, format: 'json' },
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const parsed = splitTitleArtist(data.title || '', data.author_name || '');
    if (!parsed.title) throw new Error('Could not identify a song from that YouTube video.');
    return { ...parsed, inputType: 'youtube', videoTitle: data.title, channel: data.author_name || null, youtubeUrl: value };
  }

  const parsed = splitTitleArtist(value);
  if (!parsed.title) throw new Error('Could not identify a song title from the input.');
  return { ...parsed, inputType: 'text' };
}
