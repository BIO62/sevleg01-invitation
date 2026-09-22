import fs from 'fs';
import path from 'path';

const CAMOFOX_URL = 'http://localhost:9377';
const ARTIFACT_DIR = 'C:/Users/odkos/.gemini/antigravity/brain/fbef489b-7a8f-4fde-8dd1-6076887468aa';

async function req(pathStr, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${CAMOFOX_URL}${pathStr}`, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Camofox request failed ${method} ${pathStr} [${res.status}]: ${errText}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  } else if (contentType.includes('image/')) {
    return Buffer.from(await res.arrayBuffer());
  }
  return await res.text();
}

async function run() {
  console.log('1. Opening original site tab...');
  const createRes = await req('/tabs', 'POST', {
    url: 'https://sevleg01.zollame-studio.com/',
    userId: 'orig-check-user',
    sessionKey: 'orig-check-session'
  });
  const tabId = createRes.tabId;

  // Let's set 440px width
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'orig-check-user',
    expression: `(() => {
      // Check section 21c40418 and hero section
      const hero = document.querySelector('.elementor-element-32705ccd');
      const sec21 = document.querySelector('.elementor-element-21c40418');
      const sec44 = document.querySelector('.elementor-element-441606f');
      const modalBtn = document.querySelector('[onclick*="openInvitation"]');
      if (modalBtn) modalBtn.click();
      return {
        heroStyle: hero ? window.getComputedStyle(hero).margin + ' | ' + window.getComputedStyle(hero).padding : null,
        sec21Style: sec21 ? window.getComputedStyle(sec21).margin + ' | ' + window.getComputedStyle(sec21).padding + ' | pos:' + window.getComputedStyle(sec21).position : null,
        sec44Style: sec44 ? window.getComputedStyle(sec44).margin + ' | ' + window.getComputedStyle(sec44).padding : null,
      };
    })()`
  }).then(r => console.log('Original styles:', JSON.stringify(r, null, 2)));

  await new Promise(r => setTimeout(r, 2000));
  await req(`/tabs/${tabId}?userId=orig-check-user`, 'DELETE');
}

run().catch(console.error);
