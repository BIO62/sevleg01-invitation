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
  console.log('1. Creating Camofox tab for http://localhost:3001/ ...');
  const createRes = await req('/tabs', 'POST', {
    url: 'http://localhost:3001/',
    userId: 'preview-user-2',
    sessionKey: 'preview-session-2'
  });
  const tabId = createRes.tabId;
  console.log('Tab created:', tabId);

  // Wait 3 seconds for full load
  await new Promise(r => setTimeout(r, 3000));

  // 1. Screenshot Modal
  console.log('2. Taking modal screenshot...');
  const modalImg = await req(`/tabs/${tabId}/screenshot?userId=preview-user-2`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clone_modal_verified.png'), modalImg);
  console.log('Saved clone_modal_verified.png');

  // 2. Click button to dismiss modal
  console.log('3. Clicking #openModalBtn...');
  try {
    await req(`/tabs/${tabId}/click`, 'POST', {
      selector: '#openModalBtn',
      userId: 'preview-user-2'
    });
    console.log('Clicked #openModalBtn successfully!');
  } catch(e) {
    console.log('Click fallback, attempting evaluate:', e.message);
    await req(`/tabs/${tabId}/evaluate`, 'POST', {
      userId: 'preview-user-2',
      expression: 'document.getElementById("openModalBtn").click(); true;'
    });
  }

  // Wait 1.5 seconds for fade out and hero reveal
  await new Promise(r => setTimeout(r, 1500));

  // 3. Screenshot Hero (unlocked)
  console.log('4. Taking unlocked hero screenshot...');
  const heroImg = await req(`/tabs/${tabId}/screenshot?userId=preview-user-2`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clone_hero_unlocked.png'), heroImg);
  console.log('Saved clone_hero_unlocked.png');

  // 4. Scroll down 750px to reveal Info & Ritual cards
  console.log('5. Scrolling to info & ritual cards...');
  await req(`/tabs/${tabId}/scroll`, 'POST', {
    userId: 'preview-user-2',
    direction: 'down',
    amount: 750
  });
  await new Promise(r => setTimeout(r, 1500));

  const infoImg = await req(`/tabs/${tabId}/screenshot?userId=preview-user-2`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clone_info_ritual.png'), infoImg);
  console.log('Saved clone_info_ritual.png');

  // 5. Scroll down further to reveal invitation & poem
  console.log('6. Scrolling to poem & invitation...');
  await req(`/tabs/${tabId}/scroll`, 'POST', {
    userId: 'preview-user-2',
    direction: 'down',
    amount: 1000
  });
  await new Promise(r => setTimeout(r, 1500));

  const poemImg = await req(`/tabs/${tabId}/screenshot?userId=preview-user-2`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'clone_poem_shuleg.png'), poemImg);
  console.log('Saved clone_poem_shuleg.png');

  // Close tab
  await req(`/tabs/${tabId}?userId=preview-user-2`, 'DELETE');
  console.log('Closed tab. Done verification!');
}

run().catch(err => {
  console.error('Error running preview:', err);
  process.exit(1);
});
