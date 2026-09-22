import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

// Check escaped occurrences
const escapedMatches = [...rawHtml.matchAll(/https?:\\\/\\\/sevleg01\.zollame-studio\.com[^"'\s<>&]+/gi)].map(m => m[0]);
console.log('Escaped URLs count:', escapedMatches.length);
escapedMatches.forEach(e => console.log('Escaped:', e));
