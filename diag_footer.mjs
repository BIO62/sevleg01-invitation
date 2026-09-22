const CAMOFOX = 'http://localhost:9377';
const userId = 'f4';
async function req(p, m = 'GET', b = null) {
  const o = { method: m, headers: { 'Content-Type': 'application/json' } };
  if (b) o.body = JSON.stringify(b);
  const r = await fetch(CAMOFOX + p, o);
  if (!r.ok) throw new Error(await r.text());
  return (r.headers.get('content-type') || '').includes('json') ? r.json() : r.text();
}
const EXPR = `(() => {
  const el = document.querySelector('.elementor-element-53a26e3a');
  const sec = el.closest('.elementor-section');
  return Array.from(sec.querySelectorAll('.elementor-widget')).map(w => {
    const inner = w.querySelector('.elementor-heading-title, p') || w;
    const c = getComputedStyle(inner);
    const b = w.getBoundingClientRect();
    return {
      cls: (w.className || '').split(' ').filter(x => x.indexOf('elementor-element-') === 0 || x.indexOf('elementor-widget-') === 0).join(' '),
      txt: (w.innerText || '').trim().split(String.fromCharCode(10)).join(' | ').slice(0, 55),
      font: c.fontFamily, size: c.fontSize, align: c.textAlign,
      w: Math.round(b.width), h: Math.round(b.height)
    };
  });
})()`;
(async () => {
  const { tabId } = await req('/tabs', 'POST', { url: 'http://localhost:3001/', userId, sessionKey: 'f4s' });
  await req('/tabs/' + tabId + '/viewport', 'POST', { userId, width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 4000));
  const r = await req('/tabs/' + tabId + '/evaluate', 'POST', { userId, expression: EXPR });
  console.log(JSON.stringify(r.result ?? r, null, 1));
  await req('/tabs/' + tabId + '?userId=' + userId, 'DELETE');
})().catch(e => { console.error(e); process.exit(1); });
