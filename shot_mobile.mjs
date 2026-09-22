// Mobile screenshot helper: real viewport reflow via camofox /viewport
// Usage: node shot_mobile.mjs <local|orig> <outPrefix> [width] [height]
import fs from 'fs';
import path from 'path';

const CAMOFOX_URL = 'http://localhost:9377';
const OUT_DIR = 'C:/Users/odkos/AppData/Local/Temp/claude/c--Users-odkos--gemini-antigravity-scratch-sevleg01-clone/2930444a-d7c0-435b-a74a-f97c09302c28/scratchpad/shots';
fs.mkdirSync(OUT_DIR, { recursive: true });

const target = process.argv[2] || 'local';
const prefix = process.argv[3] || target;
const W = parseInt(process.argv[4] || '390', 10);
const H = parseInt(process.argv[5] || '844', 10);

const URLS = {
  local: 'http://localhost:3001/',
  orig: 'https://sevleg01.zollame-studio.com/',
};
const userId = `shot-${target}`;

async function req(p, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CAMOFOX_URL}${p}`, opts);
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) throw new Error(`${method} ${p} [${res.status}]: ${await res.text()}`);
  if (ct.includes('application/json')) return await res.json();
  if (ct.includes('image/')) return Buffer.from(await res.arrayBuffer());
  return await res.text();
}

async function shot(tabId, name) {
  const r = await req(`/tabs/${tabId}/screenshot?userId=${userId}`, 'GET');
  let buf;
  if (Buffer.isBuffer(r)) buf = r;
  else if (r?.screenshot?.data) buf = Buffer.from(r.screenshot.data, 'base64');
  else if (typeof r === 'string') buf = Buffer.from(r, 'base64');
  else throw new Error('Unknown screenshot response: ' + JSON.stringify(r).slice(0, 200));
  const f = path.join(OUT_DIR, `${prefix}_${name}.png`);
  fs.writeFileSync(f, buf);
  console.log('saved', f, buf.length, 'bytes');
}

const evalJs = (tabId, expression) =>
  req(`/tabs/${tabId}/evaluate`, 'POST', { userId, expression });

async function run() {
  const { tabId } = await req('/tabs', 'POST', {
    url: URLS[target],
    userId,
    sessionKey: `${userId}-session`,
  });
  console.log('tab', tabId);

  await req(`/tabs/${tabId}/viewport`, 'POST', { userId, width: W, height: H });
  await new Promise(r => setTimeout(r, 2500));

  await shot(tabId, '00_modal');

  // Dismiss the welcome modal
  await evalJs(tabId, `(() => {
    const b = document.querySelector('#openModalBtn') || document.querySelector('[onclick*="openInvitation"]');
    if (b) { b.click(); return 'clicked'; }
    return 'no-button';
  })()`).then(r => console.log('modal:', JSON.stringify(r)));
  await new Promise(r => setTimeout(r, 1800));

  // Page metrics
  const metrics = await evalJs(tabId, `(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    overflowers: Array.from(document.querySelectorAll('*'))
      .filter(e => e.getBoundingClientRect().right > window.innerWidth + 2 || e.getBoundingClientRect().left < -2)
      .slice(0, 25)
      .map(e => (e.tagName + '.' + (e.className && e.className.toString ? e.className.toString().split(' ').slice(0,4).join('.') : '')
        + ' [' + Math.round(e.getBoundingClientRect().left) + ',' + Math.round(e.getBoundingClientRect().right) + ']'))
  }))()`);
  console.log('METRICS:', JSON.stringify(metrics, null, 1));

  // Pre-scroll the whole page slowly so every reveal animation fires, then return to top
  await evalJs(tabId, `(() => { let y=0; const h=document.documentElement.scrollHeight;
    const id=setInterval(()=>{y+=400;window.scrollTo(0,y); if(y>h){clearInterval(id);window.scrollTo(0,0);}},40); return h; })()`);
  await new Promise(r => setTimeout(r, 6000));

  // Scroll through the page in viewport-height steps
  const total = await evalJs(tabId, `document.documentElement.scrollHeight`);
  const totalPx = (typeof total === 'object' ? (total.result ?? total.value ?? 0) : total) || 8000;
  const steps = Math.min(14, Math.ceil(Number(totalPx) / H));
  for (let i = 0; i < steps; i++) {
    await evalJs(tabId, `window.scrollTo(0, ${i * (H - 60)}); true`);
    await new Promise(r => setTimeout(r, 900));
    await shot(tabId, String(i + 1).padStart(2, '0') + '_scroll');
  }

  await req(`/tabs/${tabId}?userId=${userId}`, 'DELETE');
  console.log('done; totalHeight =', totalPx);
}

run().catch(e => { console.error(e); process.exit(1); });
