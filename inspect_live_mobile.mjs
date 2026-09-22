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
  console.log('1. Creating tab for live original site...');
  const createLive = await req('/tabs', 'POST', {
    url: 'https://sevleg01.zollame-studio.com/#shuleg',
    userId: 'mobile-audit',
    sessionKey: 'mobile-live'
  });
  const liveTabId = createLive.tabId;

  // Set mobile viewport via evaluate
  await req(`/tabs/${liveTabId}/evaluate`, 'POST', {
    userId: 'mobile-audit',
    expression: `
      window.innerWidth = 390;
      window.innerHeight = 844;
      document.documentElement.style.maxWidth = '390px';
      document.documentElement.style.margin = '0 auto';
      true;
    `
  });

  await new Promise(r => setTimeout(r, 3500));

  // Dismiss live modal
  try {
    await req(`/tabs/${liveTabId}/click`, 'POST', {
      selector: 'button, .e-popup-modal button, [onclick*="open"]',
      userId: 'mobile-audit'
    });
  } catch(e) {
    console.log('Live modal dismiss note:', e.message);
  }
  await new Promise(r => setTimeout(r, 1500));

  // Check what happens when clicking images on live site
  const liveImgInfo = await req(`/tabs/${liveTabId}/evaluate`, 'POST', {
    userId: 'mobile-audit',
    expression: `
      const imgs = Array.from(document.querySelectorAll('img, .elementor-cta__bg, .elementor-image img'));
      imgs.map(el => ({
        tag: el.tagName,
        className: el.className,
        src: el.src || el.style.backgroundImage,
        hasLink: !!el.closest('a'),
        cursor: window.getComputedStyle(el).cursor
      }));
    `
  });
  console.log('Live image elements:', JSON.stringify(liveImgInfo, null, 2));

  // Screenshot live hero on mobile
  const liveHero = await req(`/tabs/${liveTabId}/screenshot?userId=mobile-audit`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_mobile_hero.png'), liveHero);
  console.log('Saved live_mobile_hero.png');

  // Scroll down to gallery on live site
  await req(`/tabs/${liveTabId}/evaluate`, 'POST', {
    userId: 'mobile-audit',
    expression: `document.querySelector('#gallery')?.scrollIntoView(); true;`
  });
  await new Promise(r => setTimeout(r, 1500));

  const liveGallery = await req(`/tabs/${liveTabId}/screenshot?userId=mobile-audit`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'live_mobile_gallery.png'), liveGallery);
  console.log('Saved live_mobile_gallery.png');

  await req(`/tabs/${liveTabId}?userId=mobile-audit`, 'DELETE');
}

run().catch(console.error);
