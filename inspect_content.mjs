import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

console.log('--- Search in index.html ---');
const terms = ['Google', 'maps', 'iframe', '47.93', '106.9', 'Дэнжийн', 'Галданбошгот', 'О.Золбоо', 'З.Азбаяр', 'Азбаяр', 'Оргилболд', 'хусах', 'хөндөх', 'дээл'];
for (const t of terms) {
  const count = (html.match(new RegExp(t, 'gi')) || []).length;
  console.log(`"${t}": ${count} matches`);
}

// Find where map or address should be:
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('Галданбошгот') || line.includes('Дэнжийн') || line.includes('iframe') || line.includes('map')) {
    console.log(`Line ${idx+1}: ${line.slice(0, 150)}...`);
  }
});
