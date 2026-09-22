import fs from 'fs';

const raw = fs.readFileSync('raw_index.html', 'utf8');
const idx = raw.indexOf('21c40418');
if (idx !== -1) {
  console.log('Found 21c40418 in raw_index.html:');
  console.log(raw.slice(idx - 100, idx + 800));
} else {
  console.log('21c40418 not found in raw_index.html');
}
