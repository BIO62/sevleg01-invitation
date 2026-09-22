// Screenshot a specific element region at mobile width
// node shot_section.mjs <local|orig> <selector> <name> [width]
import fs from 'fs';
import path from 'path';

const CAMOFOX_URL = 'http://localhost:9377';
const OUT_DIR = 'C:/Users/odkos/AppData/Local/Temp/claude/c--Users-odkos--gemini-antigravity-scratch-sevleg01-clone/2930444a-d7c0-435b-a74a-f97c09302c28/scratchpad/shots';
fs.mkdirSync(OUT_DIR, { recursive: true });

const target = process.argv[2] || 'local';
const selector = process.argv[3];
const name = process.argv[4] || 'sec';
const W = parseInt(process.argv[5] || '390', 10);
const URLS = { local: 'http://localhost:3001/', orig: 'https://sevleg01.zollame-studio.com/' };
const userId = `sec-${target}`;

async function req(p, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CAMOFOX_URL}${p}`, opts);
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) throw new Error(`${method} ${p} [${res.status}]: ${await res.text()}`);
  if (ct.includes('application/json')) return res.json();
  if (ct.includes('image/')) return Buffer.from(await res.arrayBuffer());
  return res.text();
}

async function shot(tabId, n) {
  const r = await req(`/tabs/${tabId}/screenshot?userId=${userId}`, 'GET');
  const buf = Buffer.isBuffer(r) ? r : Buffer.from(r.screenshot.data, 'base64');
  const f = path.join(OUT_DIR, `${target}_${n}.png`);
  fs.writeFileSync(f, buf);
  console.log('saved', f);
}

async function run() {
  const { tabId } = await req('/tabs', 'POST', { url: URLS[target], userId, sessionKey: `${userId}-s` });
  await req(`/tabs/${tabId}/viewport`, 'POST', { userId, width: W, height: 844 });
  await new Promise(r => setTimeout(r, 3000));
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId,
    expression: `(() => { const b = document.querySelector('#openModalBtn') || document.querySelector('[onclick*="openInvitation"]'); if (b) b.click(); return 1; })()`
  });
  await new Promise(r => setTimeout(r, 1500));
  // gentle full-page scroll to trigger all reveal animations, then back
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId,
    expression: `(() => { let y=0; const h=document.documentElement.scrollHeight; const id=setInterval(()=>{y+=400;window.scrollTo(0,y); if(y>h){clearInterval(id);}},40); return h; })()`
  });
  await new Promise(r => setTimeout(r, 5000));

  const info = await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId,
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return 'not found';
      const r = el.getBoundingClientRect();
      window.scrollTo(0, r.top + window.scrollY - 20);
      return { h: Math.round(r.height), top: Math.round(r.top + window.scrollY) };
    })()`
  });
  console.log('target:', JSON.stringify(info));
  await new Promise(r => setTimeout(r, 1200));
  await shot(tabId, name + '_a');
  await req(`/tabs/${tabId}/evaluate`, 'POST', { userId, expression: `window.scrollBy(0, 780); true` });
  await new Promise(r => setTimeout(r, 1000));
  await shot(tabId, name + '_b');
  await req(`/tabs/${tabId}/evaluate`, 'POST', { userId, expression: `window.scrollBy(0, 780); true` });
  await new Promise(r => setTimeout(r, 1000));
  await shot(tabId, name + '_c');

  await req(`/tabs/${tabId}?userId=${userId}`, 'DELETE');
}
run().catch(e => { console.error(e); process.exit(1); });
