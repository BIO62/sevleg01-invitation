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
  const createRes = await req('/tabs', 'POST', {
    url: 'http://localhost:3001/#shuleg',
    userId: 'preview-user-3',
    sessionKey: 'preview-session-3'
  });
  const tabId = createRes.tabId;

  await new Promise(r => setTimeout(r, 2500));

  // Dismiss modal
  try {
    await req(`/tabs/${tabId}/click`, 'POST', {
      selector: '#openModalBtn',
      userId: 'preview-user-3'
    });
  } catch(e) {}

  await new Promise(r => setTimeout(r, 1200));

  // Scroll to #shuleg
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'preview-user-3',
    expression: 'document.querySelector("#shuleg")?.scrollIntoView({ behavior: "instant" }); true;'
  });
  await new Promise(r => setTimeout(r, 1500));

  const shulegImg = await req(`/tabs/${tabId}/screenshot?userId=preview-user-3`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clone_shuleg_full.png'), shulegImg);
  console.log('Saved clone_shuleg_full.png');

  // Scroll to footer / RSVP
  await req(`/tabs/${tabId}/scroll`, 'POST', {
    userId: 'preview-user-3',
    direction: 'down',
    amount: 1400
  });
  await new Promise(r => setTimeout(r, 1500));

  const footerImg = await req(`/tabs/${tabId}/screenshot?userId=preview-user-3`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clone_footer_full.png'), footerImg);
  console.log('Saved clone_footer_full.png');

  await req(`/tabs/${tabId}?userId=preview-user-3`, 'DELETE');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
