import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 3000),
  geniusToken: process.env.GENIUS_ACCESS_TOKEN || '',
  geniusScrapeEnabled: String(process.env.GENIUS_SCRAPE_ENABLED ?? 'true').toLowerCase() === 'true',
  proxyUrl: process.env.PROXY_URL || '',
  geniusProxyUrl: process.env.GENIUS_PROXY_URL || process.env.PROXY_URL || '',
  lrclibProxyUrl: process.env.LRCLIB_PROXY_URL || process.env.PROXY_URL || ''
};
