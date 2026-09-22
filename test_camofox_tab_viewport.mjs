import fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:9377/tabs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://sevleg01.zollame-studio.com/',
      userId: 'test-vp-user',
      sessionKey: 'test-vp-session',
      viewport: { width: 440, height: 956 }
    })
  });
  const data = await res.json();
  console.log('Tab response:', data);
  if (data.tabId) {
    // Check window dimensions
    const evalRes = await fetch(`http://localhost:9377/tabs/${data.tabId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-vp-user',
        expression: '({ innerWidth: window.innerWidth, innerHeight: window.innerHeight, screenWidth: window.screen.width })'
      })
    });
    console.log('Dimensions:', await evalRes.json());
    await fetch(`http://localhost:9377/tabs/${data.tabId}?userId=test-vp-user`, { method: 'DELETE' });
  }
}

run().catch(console.error);
