import fs from 'fs';

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
  } else if (contentType.includes('image/')) {
    return Buffer.from(await res.arrayBuffer());
  }
  return await res.text();
}

async function run() {
  const createRes = await req('/tabs', 'POST', {
    url: 'http://localhost:3001/',
    userId: 'debug-user',
    sessionKey: 'debug-session'
  });
  const tabId = createRes.tabId;
  await new Promise(r => setTimeout(r, 2000));

  const info = await req(`/tabs/${tabId}/evaluate`, 'POST', {
    userId: 'debug-user',
    expression: `(() => {
      const mapCol = document.getElementById('map');
      const iframe = mapCol ? mapCol.querySelector('iframe') : null;
      const formCol = document.querySelector('[data-id="7ea77954"]');
      return {
        mapCol: mapCol ? {
          className: mapCol.className,
          rect: mapCol.getBoundingClientRect(),
          style: mapCol.getAttribute('style'),
          computedDisplay: window.getComputedStyle(mapCol).display,
          computedVisibility: window.getComputedStyle(mapCol).visibility,
          computedHeight: window.getComputedStyle(mapCol).height,
          computedWidth: window.getComputedStyle(mapCol).width,
        } : null,
        iframe: iframe ? {
          src: iframe.src,
          rect: iframe.getBoundingClientRect(),
          computedHeight: window.getComputedStyle(iframe).height,
          computedWidth: window.getComputedStyle(iframe).width,
        } : null,
        formCol: formCol ? {
          rect: formCol.getBoundingClientRect(),
          computedVisibility: window.getComputedStyle(formCol).visibility
        } : null
      };
    })()`
  });

  console.log('DOM Info:', JSON.stringify(info, null, 2));
  await req(`/tabs/${tabId}?userId=debug-user`, 'DELETE');
}

run().catch(console.error);
