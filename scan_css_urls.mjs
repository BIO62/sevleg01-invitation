import fs from 'fs';
import path from 'path';

const baseDir = 'C:/Users/odkos/.gemini/antigravity/scratch/sevleg01_clone/assets/mirror';

function scanDir(dir) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    if (fs.statSync(p).isDirectory()) {
      files = files.concat(scanDir(p));
    } else {
      files.push(p);
    }
  }
  return files;
}

const allFiles = scanDir(baseDir);
const cssFiles = allFiles.filter(f => f.endsWith('.css'));
console.log('Total CSS files:', cssFiles.length);

let remoteUrls = new Set();
for (const css of cssFiles) {
  const content = fs.readFileSync(css, 'utf8');
  const matches = content.match(/url\(['"]?(https?:\/\/[^'")]+)['"]?\)/gi) || [];
  for (const m of matches) {
    const u = m.replace(/url\(['"]?/, '').replace(/['"]?\)/, '');
    remoteUrls.add(u);
  }
}

console.log('Remote URLs found in mirrored CSS files:', remoteUrls.size);
for (const u of remoteUrls) {
  console.log('CSS URL:', u);
}
