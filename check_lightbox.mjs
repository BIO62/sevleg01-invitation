import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

// Search for lightbox, zoom, gallery in rawHtml
const matches = [...rawHtml.matchAll(/lightbox|zoom|magnific|photoswipe|gallery/gi)].map(m => m[0]);
console.log('Matches count:', matches.length);
console.log('Unique matches:', [...new Set(matches.map(m => m.toLowerCase()))]);

// Check elementorFrontendConfig for lightbox settings
const cfgMatch = rawHtml.match(/var elementorFrontendConfig = (\{[\s\S]*?\});/);
if (cfgMatch) {
  const cfg = JSON.parse(cfgMatch[1]);
  console.log('elementorFrontendConfig.settings:', cfg.settings);
}

// Check images with links or data-elementor-open-lightbox
const imgLinks = [...rawHtml.matchAll(/<a[^>]+(?:lightbox|wp-content\/uploads)[^>]*>[\s\S]*?<\/a>/gi)];
console.log('Images wrapped in links count:', imgLinks.length);
imgLinks.forEach((l, i) => console.log(`[Link ${i}]`, l[0].substring(0, 150)));

// Check gallery section HTML (Sec 9)
const galleryIdx = rawHtml.indexOf('id="gallery"');
if (galleryIdx !== -1) {
  console.log('--- Gallery snippet ---');
  console.log(rawHtml.substring(galleryIdx, galleryIdx + 1500));
}
