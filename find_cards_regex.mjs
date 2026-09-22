import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const regex = /.{0,50}(?:БИЛЭГТ|ЭХЛЭХ|11:40\s*-\s*13:40).{0,100}/g;
let m;
while ((m = regex.exec(html)) !== null) {
  console.log('Found:', m[0]);
}
