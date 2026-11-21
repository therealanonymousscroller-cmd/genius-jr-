import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

export function makeClient(proxyUrl = '') {
  const options = { timeout: 15000, headers: { 'User-Agent': 'GeniusLyricsAPI/1.0' } };
  if (proxyUrl) {
    const agent = proxyUrl.startsWith('socks')
      ? new SocksProxyAgent(proxyUrl)
      : new HttpsProxyAgent(proxyUrl);
    options.httpAgent = agent;
    options.httpsAgent = agent;
    options.proxy = false;
  }
  return axios.create(options);
}
