import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Find lines around 77151c65 (the map widget)
const idx = html.indexOf('77151c65');
if (idx !== -1) {
  const start = Math.max(0, idx - 1000);
  const end = Math.min(html.length, idx + 1500);
  console.log('--- MAP SECTION HTML ---');
  console.log(html.slice(start, end));
} else {
  console.log('77151c65 not found!');
}
