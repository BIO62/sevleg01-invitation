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
  console.log('1. Creating tab for local server at 440px...');
  const createRes = await req('/tabs', 'POST', {
    url: 'http://localhost:3001/',
    userId: 'match-user',
    sessionKey: 'match-session'
  });
  const tabId = createRes.tabId;

  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'match-user',
    expression: `(() => {
      document.documentElement.style.maxWidth = '440px';
      document.documentElement.style.margin = '0 auto';
      const modalBtn = document.querySelector('#openModalBtn') || document.querySelector('[onclick*="openInvitation"]');
      if (modalBtn) modalBtn.click();
      return true;
    })()`
  });

  await new Promise(r => setTimeout(r, 2000));

  const img = await req(`/tabs/${tabId}/screenshot?userId=match-user`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clone_440px_verified.png'), img);
  console.log('Saved clone_440px_verified.png');

  // Also check section 21c40418 column widths and rects
  const cols = await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'match-user',
    expression: `(() => {
      const sec = document.querySelector('.elementor-element-21c40418');
      return sec ? Array.from(sec.querySelectorAll('.elementor-column')).map(c => ({
        className: c.className,
        width: window.getComputedStyle(c).width,
        rect: c.getBoundingClientRect()
      })) : [];
    })()`
  });
  console.log('Column details:', JSON.stringify(cols, null, 2));

  await req(`/tabs/${tabId}?userId=match-user`, 'DELETE');
}

run().catch(console.error);
