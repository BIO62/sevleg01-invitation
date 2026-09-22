const CAMOFOX_URL = 'http://localhost:9377';
const target = process.argv[2] || 'local';
const URLS = { local: 'http://localhost:3001/', orig: 'https://sevleg01.zollame-studio.com/' };
const userId = `font-${target}`;
async function req(p, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CAMOFOX_URL}${p}`, opts);
  if (!res.ok) throw new Error(`${method} ${p} [${res.status}]: ${await res.text()}`);
  return (res.headers.get('content-type') || '').includes('json') ? res.json() : res.text();
}
const ev = (t, e) => req(`/tabs/${t}/evaluate`, 'POST', { userId, expression: e });
async function run() {
  const { tabId } = await req('/tabs', 'POST', { url: URLS[target], userId, sessionKey: `${userId}-s` });
  await req(`/tabs/${tabId}/viewport`, 'POST', { userId, width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 4000));
  const r = await ev(tabId, `(() => {
    const pick = el => { if (!el) return null; const c = getComputedStyle(el); const b = el.getBoundingClientRect();
      return { txt: (el.innerText||'').trim().slice(0,60), font: c.fontFamily, size: c.fontSize, weight: c.fontWeight, lh: c.lineHeight, color: c.color, w: Math.round(b.width), h: Math.round(b.height) }; };
    const out = {};
    // address card in the 3-card info row
    out.addrCard = pick(document.querySelector('.elementor-element-9b5fd53 .elementor-heading-title'));
    // footer blocks: find heading containing the venue address
    const all = Array.from(document.querySelectorAll('.elementor-heading-title, .elementor-widget-text-editor'));
    out.footerAddr = pick(all.find(e => /Дэнжийн|Sunny|байр/i.test(e.innerText||'')));
    out.footerTitle = pick(all.find(e => /Ёслол:/.test(e.innerText||'')));
    out.footerDate = pick(all.find(e => /Билэгт сайн|цагт/i.test(e.innerText||'')));
    // header stickiness
    const hdr = document.querySelector('.elementor-element-441606f') || document.querySelector('header');
    out.header = hdr ? { pos: getComputedStyle(hdr).position, z: getComputedStyle(hdr).zIndex, h: Math.round(hdr.getBoundingClientRect().height), cls: (hdr.className||'').toString().slice(0,120) } : null;
    // fonts actually available
    out.fontsLoaded = Array.from(document.fonts).map(f => f.family + ' ' + f.weight + ' ' + f.status).slice(0, 30);
    return out;
  })()`);
  console.log(target.toUpperCase(), JSON.stringify(r.result ?? r, null, 1));
  await req(`/tabs/${tabId}?userId=${userId}`, 'DELETE');
}
run().catch(e => { console.error(e); process.exit(1); });
