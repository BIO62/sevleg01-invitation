// Why is the mobile nav dropdown broken locally? Compare CSS/JS presence.
const CAMOFOX_URL = 'http://localhost:9377';
const target = process.argv[2] || 'local';
const URLS = { local: 'http://localhost:3001/', orig: 'https://sevleg01.zollame-studio.com/' };
const userId = `menu-${target}`;

async function req(p, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${CAMOFOX_URL}${p}`, opts);
  if (!res.ok) throw new Error(`${method} ${p} [${res.status}]: ${await res.text()}`);
  return (res.headers.get('content-type') || '').includes('json') ? res.json() : res.text();
}
const ev = (tabId, expression) => req(`/tabs/${tabId}/evaluate`, 'POST', { userId, expression });

async function run() {
  const { tabId } = await req('/tabs', 'POST', { url: URLS[target], userId, sessionKey: `${userId}-s` });
  await req(`/tabs/${tabId}/viewport`, 'POST', { userId, width: 390, height: 844 });
  await new Promise(r => setTimeout(r, 4000));

  const r1 = await ev(tabId, `(() => {
    const out = {};
    // failed resources
    out.failed = performance.getEntriesByType('resource')
      .filter(e => e.transferSize === 0 && e.decodedBodySize === 0 && !e.name.startsWith('data:'))
      .map(e => e.name.split('/').slice(-2).join('/')).slice(0, 40);
    out.stylesheets = Array.from(document.styleSheets).map(s => {
      let n = 0; try { n = s.cssRules.length; } catch(e) { n = -1; }
      return (s.href ? s.href.split('/').slice(-1)[0] : 'inline') + ':' + n;
    });
    out.scripts = Array.from(document.scripts).map(s => s.src ? s.src.split('/').slice(-1)[0] : 'inline').slice(0, 60);
    out.hasElementorFrontend = !!(window.elementorFrontend);
    out.jQuery = !!window.jQuery;
    const nav = document.querySelector('.elementor-nav-menu--dropdown');
    const ul = nav && nav.querySelector('ul.elementor-nav-menu');
    out.navCS = nav ? (() => { const c = getComputedStyle(nav); return { display: c.display, position: c.position, width: c.width, height: c.height, overflow: c.overflow, top: c.top, left: c.left }; })() : null;
    out.ulCS = ul ? (() => { const c = getComputedStyle(ul); return { display: c.display, flexDirection: c.flexDirection, width: c.width }; })() : null;
    out.navParent = nav ? (nav.parentElement.className || '').toString() : null;
    out.toggleCS = (() => { const t = document.querySelector('.elementor-menu-toggle'); return t ? { cls: t.className, aria: t.getAttribute('aria-expanded') } : null; })();
    return out;
  })()`);
  console.log(target.toUpperCase(), JSON.stringify(r1.result ?? r1, null, 1));

  await req(`/tabs/${tabId}?userId=${userId}`, 'DELETE');
}
run().catch(e => { console.error(e); process.exit(1); });
