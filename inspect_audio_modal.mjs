import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

// Find modal by searching for openInvitation or modal id
const modalIdx = rawHtml.indexOf('openInvitation');
if (modalIdx !== -1) {
  // find outer container
  const start = rawHtml.lastIndexOf('<div', modalIdx - 200);
  const snippet = rawHtml.substring(start - 200, modalIdx + 500);
  console.log('Modal around openInvitation:\n', snippet);
}

// Find all <audio> tags
const audioTags = rawHtml.match(/<audio[\s\S]*?<\/audio>/gi) || [];
console.log('Audio tags found:', audioTags.length);
audioTags.forEach(a => console.log('AUDIO:', a));

// Find any music / song .mp3 files
const mp3s = rawHtml.match(/https?:\/\/[^"'\s)]+\.mp3/gi) || [];
console.log('MP3 URLs:', mp3s);
