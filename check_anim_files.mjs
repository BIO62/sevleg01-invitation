import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone';
const urlMap = JSON.parse(fs.readFileSync(path.join(baseDir, 'url_map.json'), 'utf8'));

const animFiles = Object.keys(urlMap).filter(k => k.includes('animation') || k.includes('fade') || k.includes('slide') || k.includes('bounce'));
console.log('Animation files in urlMap:', animFiles.length);
animFiles.forEach(a => console.log('Anim:', a, '=>', urlMap[a]));
