import fs from 'fs';

const html = fs.readFileSync('raw_index.html', 'utf8');
const heroTextIdx = html.indexOf('Оргилболд');
const heroSecIdx = html.lastIndexOf('<section', heroTextIdx);
console.log('Hero section tag:');
console.log(html.slice(heroSecIdx, heroSecIdx + 400));
