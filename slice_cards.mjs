import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('11:40 - 13:40');
console.log(html.slice(Math.max(0, idx - 800), Math.min(html.length, idx + 800)));
