import fs from 'fs';

const html = fs.readFileSync('raw_index.html', 'utf8');
const sHero = html.indexOf('47014be0');
const sNext = html.indexOf('6d0ea978'); // section after cards (urilga)

console.log(html.slice(sHero, sNext));
