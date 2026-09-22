import fs from 'fs';

const raw = fs.readFileSync('raw_index.html', 'utf8');
const start = raw.indexOf('21c40418');
const end = raw.indexOf('</section>', start);
console.log('Section 21c40418 contents:');
console.log(raw.slice(start, end + 10));
