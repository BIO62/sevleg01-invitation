import fs from 'fs';

const html = fs.readFileSync('raw_index.html', 'utf8');

// Find all header or section elements near the top of <body>
const startBody = html.indexOf('<body');
const bodySnippet = html.slice(startBody, startBody + 4000);

// Look for elementor sections in bodySnippet
const sections = [...bodySnippet.matchAll(/<section[^>]*class="([^"]*)"[^>]*>/g)];
sections.forEach(s => {
  console.log('Section class:', s[1]);
});
