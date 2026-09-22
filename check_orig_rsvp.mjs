import fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:9377/tabs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://sevleg01.zollame-studio.com/',
      userId: 'orig-rsvp-user',
      sessionKey: 'orig-rsvp-session'
    })
  });
  const data = await res.json();
  const tabId = data.tabId;

  const rsvpInfo = await fetch(`http://localhost:9377/tabs/${tabId}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'orig-rsvp-user',
      expression: `(() => {
        const rsvpSec = document.getElementById('rsvp');
        const cols = rsvpSec ? Array.from(rsvpSec.querySelectorAll('.elementor-column')).map(c => ({
          className: c.className,
          computedWidth: window.getComputedStyle(c).width,
          computedDisplay: window.getComputedStyle(c).display,
          computedFlex: window.getComputedStyle(c).flex
        })) : [];
        return { cols };
      })()`
    })
  }).then(r => r.json());

  console.log('Original RSVP columns on default:', JSON.stringify(rsvpInfo, null, 2));
  await fetch(`http://localhost:9377/tabs/${tabId}?userId=orig-rsvp-user`, { method: 'DELETE' });
}

run().catch(console.error);
