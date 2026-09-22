import fs from 'fs';
import path from 'path';

const CAMOFOX_URL = 'http://localhost:9377';

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
  }
  return await res.text();
}

async function run() {
  console.log('Testing live site image clicks...');
  const createRes = await req('/tabs', 'POST', {
    url: 'https://sevleg01.zollame-studio.com/#shuleg',
    userId: 'zoom-test',
    sessionKey: 'zoom-session'
  });
  const tabId = createRes.tabId;
  await new Promise(r => setTimeout(r, 3000));

  // Dismiss modal
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'zoom-test',
    expression: `(() => {
      const b = document.querySelector('button[onclick*="openInvitation"]') || document.querySelector('.welcome-modal-overlay button') || Array.from(document.querySelectorAll('button')).find(el => el.textContent.includes('нээх'));
      if (b) b.click();
      return true;
    })()`
  });
  await new Promise(r => setTimeout(r, 1500));

  // Check event listeners or onclick on images
  const clickTest = await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'zoom-test',
    expression: `(() => {
      const report = [];
      const ctas = document.querySelectorAll('.elementor-cta');
      ctas.forEach((cta, i) => {
        const bg = cta.querySelector('.elementor-cta__bg');
        const style = window.getComputedStyle(bg);
        report.push({
          type: 'CTA ' + i,
          transform: style.transform,
          transition: style.transition
        });
      });
      return report;
    })()`
  });
  console.log('Live CTA Zoom Report:', JSON.stringify(clickTest, null, 2));

  // Check widget-call-to-action css rules
  const cssRules = await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'zoom-test',
    expression: `(() => {
      const results = [];
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules) {
            if (rule.selectorText && rule.selectorText.includes('transform-zoom-in')) {
              results.push({ selector: rule.selectorText, cssText: rule.cssText });
            }
          }
        } catch(e) {}
      }
      return results;
    })()`
  });
  console.log('Zoom CSS Rules on live site:', JSON.stringify(cssRules, null, 2));

  await req(`/tabs/${tabId}?userId=zoom-test`, 'DELETE');
}

run().catch(console.error);
