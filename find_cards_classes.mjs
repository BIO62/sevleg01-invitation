import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Find lines containing "БИЛЭГТ"
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('БИЛЭГТ') || l.includes('ЭХЛЭХ ЦАГ')) {
    console.log(`Line ${i+1}:`);
    for (let j = Math.max(0, i-5); j <= Math.min(lines.length-1, i+5); j++) {
      console.log(`  ${j+1}: ${lines[j]}`);
    }
  }
});
