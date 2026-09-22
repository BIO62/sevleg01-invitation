import fs from 'fs';

const raw = fs.readFileSync('raw_index.html', 'utf8');

const keywords = ['жилтэн', 'дээл', 'хөндөх', 'даахь', 'хусах', 'ёс', 'зан үйл'];
keywords.forEach(k => {
  const matches = [...raw.matchAll(new RegExp(k, 'gi'))];
  console.log(`Keyword "${k}": ${matches.length} matches`);
  matches.forEach(m => {
    console.log('   Context:', raw.slice(Math.max(0, m.index - 50), Math.min(raw.length, m.index + 100)).replace(/\s+/g, ' '));
  });
});
