import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const matches = [...rawHtml.matchAll(/https?:\/\/sevleg01\.zollame-studio\.com[^\s"'<>)]+/gi)].map(m => m[0]);
console.log('Total matches of sevleg01 domain in raw HTML:', matches.length);
const uniqueMatches = Array.from(new Set(matches));
console.log('Unique matches count:', uniqueMatches.length);

const urlMap = JSON.parse(fs.readFileSync(path.join(baseDir, 'url_map.json'), 'utf8'));

let unmapped = [];
for (const u of uniqueMatches) {
  if (!urlMap[u] && !urlMap[u.replace(/&amp;/g, '&')]) {
    unmapped.push(u);
  }
}
console.log('Unmapped URLs count:', unmapped.length);
unmapped.forEach(u => console.log('UNMAPPED:', u));
