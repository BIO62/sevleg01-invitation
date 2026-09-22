import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const rawHtml = fs.readFileSync(path.join(baseDir, 'raw_index.html'), 'utf8');

// Check data-settings attribute
const dsMatches = [...rawHtml.matchAll(/data-settings=([\"'])(.*?)\1/gi)];
console.log('data-settings attributes count:', dsMatches.length);
dsMatches.slice(0, 10).forEach((m, idx) => {
  console.log(`Setting ${idx}:`, m[2].substring(0, 100));
});

// Check animation classes
const animClasses = [...rawHtml.matchAll(/elementor-animation-[a-zA-Z0-9-]+|animated\s+[a-zA-Z0-9-]+|fadeIn[a-zA-Z0-9]+/gi)].map(m => m[0]);
console.log('Animation occurrences:', animClasses.slice(0, 20));

// Check background slideshow / hero background
const heroSection = rawHtml.substring(rawHtml.indexOf('<body'), rawHtml.indexOf('</body'));
// Let's find background images or slideshow in HTML
const bgImages = [...rawHtml.matchAll(/background(?:-image)?:\s*url\(([^)]+)\)/gi)].map(m => m[1]);
console.log('Inline CSS background images:', bgImages);

// Check all image tags
const imgTags = [...rawHtml.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('Image tag srcs count:', imgTags.length);
imgTags.slice(0, 15).forEach(img => console.log('IMG:', img));

// Check swiper slides
const swiperSlides = [...rawHtml.matchAll(/swiper-slide[^"']*["'][^>]*>/gi)];
console.log('Swiper slides count:', swiperSlides.length);
