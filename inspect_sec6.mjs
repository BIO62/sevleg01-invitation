import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const sec6Idx = rawHtml.indexOf('3cab2943');
if (sec6Idx !== -1) {
  const secStart = rawHtml.lastIndexOf('<section', sec6Idx);
  const secEnd = rawHtml.indexOf('</section>', sec6Idx) + 10;
  console.log('--- TopSec 6 HTML ---');
  console.log(rawHtml.substring(secStart, secEnd));
}
