import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

// Check elementorFrontendConfig
const match = rawHtml.match(/var elementorFrontendConfig = (\{[\s\S]*?\});/);
if (match) {
  console.log('elementorFrontendConfig found!');
  const cfg = JSON.parse(match[1]);
  console.log('Environment mode:', cfg.environmentMode);
  console.log('URLs:', cfg.urls);
} else {
  console.log('elementorFrontendConfig not matched via regex');
}

// Check scripts loaded in rawHtml
const scriptTags = [...rawHtml.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('Total external scripts in rawHtml:', scriptTags.length);
scriptTags.slice(0, 15).forEach(s => console.log('Script:', s));
