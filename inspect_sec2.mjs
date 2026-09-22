import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const sec2Idx = rawHtml.indexOf('47014be0');
if (sec2Idx !== -1) {
  const secStart = rawHtml.lastIndexOf('<section', sec2Idx);
  const secEnd = rawHtml.indexOf('</section>', sec2Idx) + 10;
  console.log('--- TopSec 2 HTML ---');
  console.log(rawHtml.substring(secStart, secEnd));
}
