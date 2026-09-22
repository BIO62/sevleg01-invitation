import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

const ctaMatches = [...rawHtml.matchAll(/<div[^>]*elementor-widget-call-to-action[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/gi)];
console.log('CTA matches:', ctaMatches.length);
ctaMatches.forEach((c, idx) => {
  console.log(`\n=== CTA ${idx} ===\n`, c[0]);
});
