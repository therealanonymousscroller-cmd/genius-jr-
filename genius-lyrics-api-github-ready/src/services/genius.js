import { makeClient } from '../http.js';
import { config } from '../config.js';
import { cleanText } from '../utils.js';

const http = makeClient(config.geniusProxyUrl);

export async function searchGenius(query) {
  if (config.geniusToken) {
    const { data } = await http.get('https://api.genius.com/search', {
      params: { q: query },
      headers: { Authorization: `Bearer ${config.geniusToken}` }
    });
    return (data.response?.hits || []).map(hit => ({
      title: hit.result?.title || '',
      artist: hit.result?.primary_artist?.name || '',
      url: hit.result?.url || '',
      geniusId: hit.result?.id || null,
      album: hit.result?.album?.name || null,
      releaseDate: hit.result?.release_date_for_display || null,
      thumbnail: undefined
    }));
  }

  // Public search endpoint fallback; this can change or become unavailable.
  const { data } = await http.get('https://genius.com/api/search/multi', {
    params: { q: query, per_page: 10 },
    headers: { Accept: 'application/json', Referer: 'https://genius.com/' }
  });
  const sections = data.response?.sections || [];
  return sections.flatMap(section => section.hits || [])
    .filter(hit => hit.type === 'song' || hit.result?.url)
    .map(hit => ({
      title: cleanText(hit.result?.title || ''),
      artist: cleanText(hit.result?.primary_artist?.name || ''),
      url: hit.result?.url || '',
      geniusId: hit.result?.id || null,
      album: hit.result?.album?.name || null,
      releaseDate: hit.result?.release_date_for_display || null
    })).filter(song => song.title && song.url);
}

export async function scrapeGeniusPage(url) {
  if (!config.geniusScrapeEnabled) throw new Error('Genius page reading is disabled.');
  if (!/^https:\/\/(www\.)?genius\.com\//i.test(url)) throw new Error('Only Genius song URLs are accepted.');
  const { data: html } = await http.get(url, { headers: { Referer: 'https://genius.com/' } });
  const cheerio = await import('cheerio');
  const $ = cheerio.load(html);
  const containers = $('[data-lyrics-container="true"]');
  const lyrics = containers.map((_, el) => $(el).text()).get().join('\n').trim();
  const title = cleanText($('meta[property="og:title"]').attr('content') || $('title').text()).replace(/\s*\|\s*Genius.*$/i, '');
  const description = cleanText($('meta[name="description"]').attr('content') || '');
  return { title, lyrics, description, url };
}
