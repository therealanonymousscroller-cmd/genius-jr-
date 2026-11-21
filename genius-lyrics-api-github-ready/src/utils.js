export function cleanText(value = '') {
  return String(value).replace(/\s+/g, ' ').trim();
}

export function parseLrc(lrc = '') {
  const lines = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const match = raw.match(/^\[(\d{2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)$/);
    if (!match) continue;
    const fraction = Number(`0.${match[3] || '0'}`);
    const startTime = Number(match[1]) * 60 + Number(match[2]) + fraction;
    lines.push({ startTime, text: cleanText(match[4]) });
  }
  return lines;
}

export function parseWordSyncedLines(lines = []) {
  if (!Array.isArray(lines)) return [];
  return lines.map(line => ({
    startTime: line.startTimeMs != null ? Number(line.startTimeMs) / 1000 : line.startTime,
    endTime: line.endTimeMs != null ? Number(line.endTimeMs) / 1000 : line.endTime,
    words: Array.isArray(line.words) ? line.words.map(word => ({
      word: word.word ?? word.text ?? '',
      startTime: word.startTimeMs != null ? Number(word.startTimeMs) / 1000 : word.startTime,
      endTime: word.endTimeMs != null ? Number(word.endTimeMs) / 1000 : word.endTime
    })) : []
  }));
}
