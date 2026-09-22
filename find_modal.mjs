import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const idx1 = rawHtml.indexOf('Таныг урьж байна');
if (idx1 !== -1) {
  console.log('--- CONTEXT 1 ---');
  console.log(rawHtml.substring(Math.max(0, idx1 - 400), Math.min(rawHtml.length, idx1 + 400)));
}

const idx2 = rawHtml.indexOf('Хүндэтгэсэн:');
if (idx2 !== -1) {
  console.log('--- CONTEXT 2 ---');
  console.log(rawHtml.substring(Math.max(0, idx2 - 400), Math.min(rawHtml.length, idx2 + 400)));
}
