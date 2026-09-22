import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const html = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

// Find all occurrences of flip-box
const fb = [...html.matchAll(/elementor-widget-flip-box[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/gi)];
console.log('Flip box count:', fb.length);
fb.forEach((f, i) => {
  console.log(`Flipbox ${i}:`, f[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
});

// Let's also search for paragraphs
const pMatches = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
console.log('Paragraph count:', pMatches.length);
pMatches.forEach(p => console.log('P:', p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()));
