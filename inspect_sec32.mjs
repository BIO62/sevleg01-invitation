import fs from 'fs';

const html = fs.readFileSync('raw_index.html', 'utf8');
const s32 = html.indexOf('32705ccd');
const s44 = html.indexOf('441606f');
console.log('--- SECTION 32705ccd ---');
console.log(html.slice(s32, s44).slice(0, 1500));
