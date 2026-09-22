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
  console.log('1. Creating tab for local server with mobile viewport...');
  const createRes = await req('/tabs', 'POST', {
    url: 'http://localhost:3001/',
    userId: 'mobile-verify-user',
    sessionKey: 'mobile-session'
  });
  const tabId = createRes.tabId;

  // Set mobile dimensions (iPhone 14 / 390px width)
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'mobile-verify-user',
    expression: `(() => {
      window.innerWidth = 390;
      window.innerHeight = 844;
      document.documentElement.style.maxWidth = '390px';
      document.documentElement.style.margin = '0 auto';
      return true;
    })()`
  });

  await new Promise(r => setTimeout(r, 2500));

  // Dismiss modal
  console.log('2. Dismissing modal...');
  await req(`/tabs/${tabId}/click`, 'POST', {
    selector: '#openModalBtn',
    userId: 'mobile-verify-user'
  });
  await new Promise(r => setTimeout(r, 1200));

  // Mobile Hero screenshot
  console.log('3. Taking mobile hero screenshot...');
  const heroImg = await req(`/tabs/${tabId}/screenshot?userId=mobile-verify-user`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_hero.png'), heroImg);
  console.log('Saved mobile_hero.png');

  // Scroll to 3 info cards (confirm ritual cards are gone)
  console.log('4. Scrolling to info cards...');
  await req(`/tabs/${tabId}/scroll`, 'POST', {
    userId: 'mobile-verify-user',
    direction: 'down',
    amount: 550
  });
  await new Promise(r => setTimeout(r, 1200));

  const infoImg = await req(`/tabs/${tabId}/screenshot?userId=mobile-verify-user`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_info_cards.png'), infoImg);
  console.log('Saved mobile_info_cards.png');

  // Scroll to Map & RSVP
  console.log('5. Scrolling to Map & Location...');
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'mobile-verify-user',
    expression: `(() => {
      document.querySelector('#map')?.scrollIntoView({ behavior: 'instant', block: 'center' });
      return true;
    })()`
  });
  await new Promise(r => setTimeout(r, 2000));

  const mapImg = await req(`/tabs/${tabId}/screenshot?userId=mobile-verify-user`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_map_location.png'), mapImg);
  console.log('Saved mobile_map_location.png');

  // Test zoom on image
  console.log('6. Testing image zoom click...');
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'mobile-verify-user',
    expression: `(() => {
      const firstCta = document.querySelector('.elementor-cta');
      if (firstCta) firstCta.click();
      return true;
    })()`
  });
  await new Promise(r => setTimeout(r, 800));

  const zoomImg = await req(`/tabs/${tabId}/screenshot?userId=mobile-verify-user`, 'GET');
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'mobile_image_zoom.png'), zoomImg);
  console.log('Saved mobile_image_zoom.png');

  await req(`/tabs/${tabId}?userId=mobile-verify-user`, 'DELETE');
  console.log('Verification finished!');
}

run().catch(console.error);
