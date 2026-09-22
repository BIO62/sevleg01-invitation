import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const navLinks = [...rawHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi)];
console.log('Total <a> tags:', navLinks.length);
navLinks.forEach(l => {
  if (l[1].includes('sevleg') || l[1].startsWith('#')) {
    console.log('Link:', l[1], 'Text:', l[2].replace(/<[^>]+>/g, '').trim());
  }
});
