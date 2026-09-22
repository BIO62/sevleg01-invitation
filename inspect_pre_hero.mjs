import fs from 'fs';

const html = fs.readFileSync('raw_index.html', 'utf8');
const bodyIdx = html.indexOf('<body');
const secIdx = html.indexOf('32705ccd');

console.log(html.slice(bodyIdx, secIdx));
