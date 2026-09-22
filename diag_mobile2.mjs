// Mobile interaction checks: hamburger menu, footer, sticky player, form, tap targets
import fs from 'fs';
import path from 'path';

const CAMOFOX_URL = 'http://localhost:9377';
const OUT = 'C:/Users/odkos/AppData/Local/Temp/claude/c--Users-odkos--gemini-antigravity-scratch-sevleg01-clone/2930444a-d7c0-435b-a74a-f97c09302c28/scratchpad/shots';
fs.mkdirSync(OUT, { recursive: true });
const target = process.argv[2] || 'local';
const URLS = { local: 'http://localhost:3001/', orig: 'https://sevleg01.zollame-studio.com/' };
const userId = `int-${target}`;

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
  fs.writeFileSync(path.join(OUT, `${target}_int_${n}.png`), buf);
  console.log('saved', `${target}_int_${n}.png`);
}
const ev = (tabId, expression) => req(`/tabs/${tabId}/evaluate`, 'POST', { userId, expression });

async function run() {
  const { tabId } = await req('/tabs', 'POST', { url: URLS[target], userId, sessionKey: `${userId}-s` });
  await req(`/tabs/${tabId}/viewport`, 'POST', { userId, width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 3000));
  await ev(tabId, `(() => { const b=document.querySelector('#openModalBtn')||document.querySelector('[onclick*="openInvitation"]'); if(b) b.click(); return 1; })()`);
  await new Promise(r => setTimeout(r, 1500));
  await ev(tabId, `(() => { let y=0; const h=document.documentElement.scrollHeight; const id=setInterval(()=>{y+=400;window.scrollTo(0,y); if(y>h){clearInterval(id);window.scrollTo(0,0);}},40); return h; })()`);
  await new Promise(r => setTimeout(r, 6000));

  // 1. Hamburger menu
  console.log('--- hamburger ---');
  const ham = await ev(tabId, `(() => {
    const t = document.querySelector('.elementor-menu-toggle');
    if (!t) return 'no toggle';
    t.click();
    return 'clicked';
  })()`);
  console.log(JSON.stringify(ham));
  await new Promise(r => setTimeout(r, 1200));
  await shot(tabId, 'menu');
  const menuGeom = await ev(tabId, `(() => {
    const nav = document.querySelector('.elementor-nav-menu--dropdown');
    if (!nav) return 'none';
    const r = nav.getBoundingClientRect();
    const cs = getComputedStyle(nav);
    return { left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), display: cs.display, items: Array.from(nav.querySelectorAll('a')).map(a => a.textContent.trim() + ' -> ' + a.getAttribute('href')) };
  })()`);
  console.log('menu geom:', JSON.stringify(menuGeom, null, 1));

  // close menu
  await ev(tabId, `(() => { const t=document.querySelector('.elementor-menu-toggle'); if(t && t.classList.contains('elementor-active')) t.click(); return 1; })()`);
  await new Promise(r => setTimeout(r, 800));

  // 2. Footer bottom
  await ev(tabId, `window.scrollTo(0, document.documentElement.scrollHeight); true`);
  await new Promise(r => setTimeout(r, 1500));
  await shot(tabId, 'footer');

  // 3. Small text audit: any text rendering under 12px
  const tiny = await ev(tabId, `(() => {
    const out = [];
    document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,a,li,div.elementor-heading-title,label,input,textarea,select,button').forEach(e => {
      if (!e.offsetParent && getComputedStyle(e).position !== 'fixed') return;
      const txt = (e.childNodes.length && Array.from(e.childNodes).filter(n=>n.nodeType===3).map(n=>n.textContent.trim()).join('')) || '';
      if (!txt) return;
      const fs = parseFloat(getComputedStyle(e).fontSize);
      if (fs < 13) out.push({ fs, cls: (e.className||'').toString().split(' ').slice(0,3).join('.'), txt: txt.slice(0, 45) });
    });
    return out.slice(0, 30);
  })()`);
  console.log('TINY TEXT:', JSON.stringify(tiny, null, 1));

  // 4. Tap target audit (interactive elements smaller than 40px)
  const taps = await ev(tabId, `(() => {
    const out = [];
    document.querySelectorAll('a,button,input,select,textarea,.elementor-menu-toggle').forEach(e => {
      const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      if (r.height < 40) out.push({ h: Math.round(r.height), w: Math.round(r.width), tag: e.tagName, cls:(e.className||'').toString().split(' ').slice(0,2).join('.'), txt: (e.textContent||e.value||'').trim().slice(0,30) });
    });
    return out.slice(0, 30);
  })()`);
  console.log('SMALL TAP TARGETS:', JSON.stringify(taps, null, 1));

  await req(`/tabs/${tabId}?userId=${userId}`, 'DELETE');
}
run().catch(e => { console.error(e); process.exit(1); });
