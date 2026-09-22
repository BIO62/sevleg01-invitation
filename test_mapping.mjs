import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const urlMap = JSON.parse(fs.readFileSync(path.join(baseDir, 'url_map.json'), 'utf8'));

console.log('Sample mappings:');
for (const [k, v] of Object.entries(urlMap).slice(0, 10)) {
  console.log(k, '=>', v);
}

// Check how many URLs in rawHtml match urlMap keys
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

let foundInHtml = 0;
for (const k of Object.keys(urlMap)) {
  if (rawHtml.includes(k)) {
    foundInHtml++;
  } else {
    // check if it matches without query string
    const noQuery = k.split('?')[0];
    if (rawHtml.includes(noQuery)) {
      // console.log('Matches without query:', noQuery);
    } else {
      console.log('Not found in HTML:', k);
    }
  }
}
console.log(`Found in HTML: ${foundInHtml} of ${Object.keys(urlMap).length}`);
