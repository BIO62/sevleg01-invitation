import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const sectionRegex = /<section\b[\s\S]*?<\/section>/gi;
let match;
let count = 0;

// Or find by class elementor-top-section
const topSections = [...rawHtml.matchAll(/<section[^>]*class=["'][^"']*elementor-top-section[^"']*["'][^>]*>([\s\S]*?)<\/section>(?=\s*(?:<section[^>]*class=["'][^"']*elementor-top-section|$))/gi)];

console.log('Top sections found:', topSections.length);
topSections.forEach((s, idx) => {
  const content = s[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const idMatch = s[0].match(/id=["']([^"']+)["']/);
  const id = idMatch ? idMatch[1] : '';
  console.log(`[TopSec ${idx}] id="${id}" text: ${content.substring(0, 120)}...`);
});
