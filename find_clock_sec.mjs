import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('e-far-clock');
if (idx !== -1) {
  const start = Math.max(0, idx - 1500);
  const end = Math.min(html.length, idx + 1500);
  console.log(html.slice(start, end));
} else {
  console.log('e-far-clock not found');
}
