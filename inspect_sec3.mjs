import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const sec3Idx = rawHtml.indexOf('28cb0447');
if (sec3Idx !== -1) {
  const secStart = rawHtml.lastIndexOf('<section', sec3Idx);
  const secEnd = rawHtml.indexOf('</section>', sec3Idx) + 10;
  console.log('--- TopSec 3 HTML ---');
  console.log(rawHtml.substring(secStart, secEnd));
}
