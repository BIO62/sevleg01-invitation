import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');

// Find all section tags
const sectionMatches = [...html.matchAll(/<section[^>]*data-id="([^"]+)"[^>]*>/g)];
console.log('Sections found:', sectionMatches.map(m => m[1]));

// Let's inspect each section's first 200 chars
sectionMatches.forEach(m => {
  const dataId = m[1];
  const start = m.index;
  console.log(`\nSection [${dataId}]:`, html.slice(start, start + 300).replace(/\s+/g, ' '));
});
