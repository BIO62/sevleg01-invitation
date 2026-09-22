import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const html = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const mapIdx = html.indexOf('google.com/maps');
if (mapIdx !== -1) {
  const iframeStart = html.lastIndexOf('<iframe', mapIdx);
  const iframeEnd = html.indexOf('</iframe>', mapIdx) + 9;
  console.log('--- MAP IFRAME ---');
  console.log(html.substring(iframeStart, iframeEnd));
} else {
  console.log('No google.com/maps found in raw_index.html');
}
