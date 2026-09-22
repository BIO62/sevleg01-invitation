import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const sec7Idx = rawHtml.indexOf('17ddda0f');
if (sec7Idx !== -1) {
  const secStart = rawHtml.lastIndexOf('<section', sec7Idx);
  const secEnd = rawHtml.indexOf('</section>', sec7Idx) + 10;
  console.log('--- TopSec 7 HTML ---');
  console.log(rawHtml.substring(secStart, secEnd));
}
