import { spawn } from 'node:child_process';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9222;

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function rectsOverlap(r1, r2) {
  return !(
    r2.left >= r1.right ||
    r2.right <= r1.left ||
    r2.top >= r1.bottom ||
    r2.bottom <= r1.top
  );
}

async function runCheck(viewport) {
  console.log(`\n========================================`);
  console.log(`Checking Viewport: ${viewport.width}x${viewport.height}`);
  console.log(`========================================`);

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--window-size=${viewport.width},${viewport.height}`,
    '--disable-gpu',
    '--disable-extensions',
    '--no-sandbox',
    'http://localhost:3000',
  ]);

  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const tabs = await res.json();
      const pageTab = tabs?.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTab) {
        wsUrl = pageTab.webSocketDebuggerUrl;
        break;
      }
    } catch { }
    await sleep(200);
  }

  if (!wsUrl) {
    chromeProc.kill();
    throw new Error('Failed to connect to headless Chrome CDP');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve) => (ws.onopen = resolve));

  let reqId = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const id = reqId++;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable Page events and navigate
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: 'http://localhost:3000' });

  // Wait for load event
  await new Promise((resolve) => {
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Page.loadEventFired') {
        ws.removeEventListener('message', handler);
        resolve();
      }
    };
    ws.addEventListener('message', handler);
    // Timeout fallback
    setTimeout(() => {
      ws.removeEventListener('message', handler);
      resolve();
    }, 3000);
  });

  await sleep(1000);

  // Evaluate DOM overlap check inside page
  const evalResult = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        // Collect all ornaments explicitly marked with data-ornament
        const ornaments = Array.from(document.querySelectorAll('[data-ornament]'));
        
        // Collect all text, inputs, buttons, and cards
        const textAndInteractive = Array.from(document.querySelectorAll(
          'h1, h2, h3, p, span, label, input, button, a, [data-card]'
        )).filter(el => {
          // Ignore if element is inside an ornament
          if (ornaments.some(o => o.contains(el))) return false;
          // Ignore hidden or 0-size elements
          const rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return false;
          // Must have text or be interactive
          const hasText = el.textContent && el.textContent.trim().length > 0;
          const isInteractive = ['BUTTON', 'INPUT', 'A'].includes(el.tagName);
          return hasText || isInteractive;
        });

        const intersections = [];

        function overlaps(r1, r2) {
          return !(r2.left >= r1.right || r2.right <= r1.left || r2.top >= r1.bottom || r2.bottom <= r1.top);
        }

        ornaments.forEach(o => {
          const oRect = o.getBoundingClientRect();
          if (oRect.width === 0 || oRect.height === 0) return;
          const oTag = o.getAttribute('data-ornament') || o.className || 'ornament';

          textAndInteractive.forEach(t => {
            const tRect = t.getBoundingClientRect();
            if (overlaps(oRect, tRect)) {
              intersections.push({
                ornament: oTag,
                element: t.tagName.toLowerCase() + (t.textContent ? ' ("' + t.textContent.trim().slice(0, 20) + '")' : ''),
                oRect: { top: Math.round(oRect.top), bottom: Math.round(oRect.bottom), left: Math.round(oRect.left), right: Math.round(oRect.right) },
                tRect: { top: Math.round(tRect.top), bottom: Math.round(tRect.bottom), left: Math.round(tRect.left), right: Math.round(tRect.right) }
              });
            }
          });
        });

        return {
          totalOrnaments: ornaments.length,
          totalContentElements: textAndInteractive.length,
          intersections: intersections
        };
      })()
    `,
  });

  ws.close();
  chromeProc.kill();

  const data = evalResult.result.value;
  console.log(`Ornaments scanned: ${data.totalOrnaments}`);
  console.log(`Content elements scanned: ${data.totalContentElements}`);
  console.log(`Intersections found: ${data.intersections.length}`);

  if (data.intersections.length > 0) {
    console.error('FAILED: Overlaps detected:');
    console.error(data.intersections);
    return false;
  } else {
    console.log('PASSED: Zero overlap between ornaments and text/interactive elements!');
    return true;
  }
}

async function main() {
  const p1440 = await runCheck({ width: 1440, height: 900 });
  const p1280 = await runCheck({ width: 1280, height: 720 });

  if (p1440 && p1280) {
    console.log('\n>>> ALL SAFE ZONE CHECKS PASSED AT 1440x900 AND 1280x720! <<<');
    process.exit(0);
  } else {
    console.error('\n>>> SAFE ZONE CHECKS FAILED! <<<');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
