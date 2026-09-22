import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const urlMap = JSON.parse(fs.readFileSync(path.join(baseDir, 'url_map.json'), 'utf8'));

console.log('Checking downloaded files from urlMap:');
let missing = 0;
let existing = 0;
for (const [url, relPath] of Object.entries(urlMap)) {
  const fullPath = path.join(baseDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log('MISSING:', url, '->', fullPath);
    missing++;
  } else {
    existing++;
  }
}
console.log(`Summary: ${existing} exist, ${missing} missing.`);
