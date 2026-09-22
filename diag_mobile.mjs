// Dump per-section geometry at mobile width to locate empty gaps
import fs from 'fs';

const CAMOFOX_URL = 'http://localhost:9377';
const target = process.argv[2] || 'local';
const W = parseInt(process.argv[3] || '390', 10);
const URLS = { local: 'http://localhost:3001/', orig: 'https://sevleg01.zollame-studio.com/' };
const userId = `diag-${target}`;

async function req(p, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CAMOFOX_URL}${p}`, opts);
  if (!res.ok) throw new Error(`${method} ${p} [${res.status}]: ${await res.text()}`);
  return (res.headers.get('content-type') || '').includes('json') ? res.json() : res.text();
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
  // force all lazy animations visible & scroll to bottom to trigger everything
  await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId,
    expression: `(() => { let y=0; const h=document.documentElement.scrollHeight; const id=setInterval(()=>{y+=600;window.scrollTo(0,y); if(y>h){clearInterval(id);window.scrollTo(0,0);}},30); return h; })()`
  });
  await new Promise(r => setTimeout(r, 4000));

  const out = await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId,
    expression: `(() => {
      const secs = Array.from(document.querySelectorAll('.elementor-section.elementor-top-section, section.elementor-top-section'));
      return secs.map((s, i) => {
        const r = s.getBoundingClientRect();
        const cs = getComputedStyle(s);
        const inner = s.querySelector('.elementor-container');
        const ir = inner ? inner.getBoundingClientRect() : null;
        const widgets = Array.from(s.querySelectorAll(':scope .elementor-widget')).map(w => {
          const wr = w.getBoundingClientRect();
          return {
            cls: (w.className||'').toString().split(' ').filter(c=>c.startsWith('elementor-widget-')||c.startsWith('elementor-element-')).join(' '),
            h: Math.round(wr.height), w: Math.round(wr.width),
            vis: getComputedStyle(w).display + '/' + getComputedStyle(w).visibility + '/' + getComputedStyle(w).opacity,
            txt: (w.innerText||'').trim().slice(0,40)
          };
        });
        return {
          i,
          id: (s.className||'').toString().split(' ').find(c=>c.startsWith('elementor-element-')) || s.id,
          top: Math.round(r.top + window.scrollY),
          h: Math.round(r.height),
          pad: cs.paddingTop + ' ' + cs.paddingBottom,
          minH: cs.minHeight,
          innerH: ir ? Math.round(ir.height) : null,
          widgetTotalH: widgets.reduce((a,b)=>a+b.h,0),
          widgets
        };
      });
    })()`
  });
  fs.writeFileSync(`C:/Users/odkos/AppData/Local/Temp/claude/c--Users-odkos--gemini-antigravity-scratch-sevleg01-clone/2930444a-d7c0-435b-a74a-f97c09302c28/scratchpad/diag_${target}.json`, JSON.stringify(out.result ?? out, null, 1));
  const secs = out.result ?? out;
  for (const s of secs) {
    console.log(`#${s.i} ${s.id} top=${s.top} h=${s.h} minH=${s.minH} pad=${s.pad} innerH=${s.innerH} widgetsH=${s.widgetTotalH} nW=${s.widgets.length}`);
  }
  await req(`/tabs/${tabId}?userId=${userId}`, 'DELETE');
}
run().catch(e => { console.error(e); process.exit(1); });
