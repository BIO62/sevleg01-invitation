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
    userId: 'orig-snap-user',
    sessionKey: 'orig-snap-session'
  });
  const tabId = createRes.tabId;

  // Let's set 440px width
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'orig-snap-user',
    expression: `(() => {
      document.documentElement.style.maxWidth = '440px';
      document.documentElement.style.margin = '0 auto';
      const modalBtn = document.querySelector('[onclick*="openInvitation"]');
      if (modalBtn) modalBtn.click();
      return true;
    })()`
  });

  await new Promise(r => setTimeout(r, 2000));

  // Get DOM details of section 21c40418
  const details = await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'orig-snap-user',
    expression: `(() => {
      const sec = document.querySelector('.elementor-element-21c40418');
      const cols = sec ? Array.from(sec.querySelectorAll('.elementor-column')).map(c => ({
        className: c.className,
        rect: c.getBoundingClientRect(),
        computedWidth: window.getComputedStyle(c).width,
        computedDisplay: window.getComputedStyle(c).display
      })) : [];
      return {
        secRect: sec ? sec.getBoundingClientRect() : null,
        secStyle: sec ? window.getComputedStyle(sec).cssText : null,
        cols
      };
    })()`
  });

  console.log('Original DOM details on 440px:', JSON.stringify(details, null, 2));

  const img = await req(`/tabs/${tabId}/screenshot?userId=orig-snap-user`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'orig_site_440px.png'), img);
  console.log('Saved orig_site_440px.png');

  await req(`/tabs/${tabId}?userId=orig-snap-user`, 'DELETE');
}

run().catch(console.error);
