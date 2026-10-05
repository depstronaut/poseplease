import { spawn } from 'node:child_process';
import fs from 'node:fs';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9225;

async function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function run() {
  const roomCode = 'MEME' + Math.floor(Math.random() * 89 + 10);
  const targetUrl = `http://localhost:3000/room/${roomCode}`;

  console.log('Starting headless Chrome for URL:', targetUrl);

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1440,900',
    '--disable-gpu',
    '--disable-extensions',
    '--no-sandbox',
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    targetUrl,
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
    } catch {}
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

  await send('Page.enable');
  await send('Runtime.enable');

  ws.addEventListener('message', (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('[Browser Console]', data.params.type, data.params.args.map((a) => a.value).join(' '));
    }
  });

  console.log('Navigating page to:', targetUrl);
  await send('Page.navigate', { url: targetUrl });

  // Wait for lobby to be loaded and connected
  console.log('Waiting for LobbyView to be connected...');
  let ready = false;
  for (let i = 0; i < 60; i++) {
    await sleep(500);
    const evalInfo = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        ({
          href: window.location.href,
          text: document.body ? document.body.innerText.slice(0, 100) : '',
          hasLobby: document.body ? document.body.innerText.includes('DAFTAR PEMAIN') : false,
        })
      `,
    });
    const val = evalInfo.result?.value;
    if (val?.hasLobby) {
      console.log('Lobby is ready! Found text:', val.text.replace(/\\n/g, ' '));
      ready = true;
      break;
    } else {
      if (i % 5 === 0) console.log('Waiting... Current URL:', val?.href, 'Snippet:', val?.text?.replace(/\\n/g, ' '));
    }
  }

  if (!ready) {
    throw new Error('Lobby did not load within timeout');
  }

  await sleep(1000);

  // Check buttons
  const initialButtons = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText,
          disabled: b.disabled,
          ariaLabel: b.getAttribute('aria-label')
        }));
      })()
    `
  });
  console.log('Buttons before solo toggle:', initialButtons.result?.value);

  // Toggle Solo mode
  console.log('Toggling Solo Mode...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const soloBtn = btns.find(b => b.getAttribute('aria-label') === 'Aktifkan Mode Solo');
        if (soloBtn) {
          soloBtn.click();
          console.log('Clicked solo button');
        } else {
          console.log('Solo button not found');
        }
      })()
    `,
  });

  await sleep(1000);

  const buttonsAfterSolo = await send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        return Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText,
          disabled: b.disabled,
          ariaLabel: b.getAttribute('aria-label')
        }));
      })()
    `
  });
  console.log('Buttons after solo toggle:', buttonsAfterSolo.result?.value);

  // Click Mulai
  console.log('Clicking Mulai Solo...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const startBtn = btns.find(b => b.textContent.includes('MULAI'));
        if (startBtn) {
          console.log('Start button disabled:', startBtn.disabled);
          startBtn.click();
        } else {
          console.log('Start button not found');
        }
      })()
    `,
  });

  // Wait for game stage
  console.log('Waiting for game stage to show meme...');
  let foundMeme = null;
  for (let i = 0; i < 20; i++) {
    await sleep(500);
    const evalInfo = await send('Runtime.evaluate', {
      returnByValue: true,
      expression: `
        (() => {
          const img = document.querySelector('img[src*="/memes/"]');
          const title = document.querySelector('h2, span.font-display.font-black.text-lg');
          return {
            bodyTextSnippet: document.body.innerText.slice(0, 150),
            memeSrc: img ? img.src : null,
            title: title ? title.textContent : null,
          };
        })()
      `,
    });
    if (evalInfo.result?.value?.memeSrc) {
      foundMeme = evalInfo.result.value;
      console.log('SUCCESS! Found in-game meme:', foundMeme);
      break;
    } else {
      console.log('Iteration', i, 'body snippet:', evalInfo.result?.value?.bodyTextSnippet?.replace(/\\n/g, ' '));
    }
  }

  await sleep(500);

  // Capture screenshot
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  if (screenshot && screenshot.data) {
    const outPath = '/Users/depstronaut/.gemini/antigravity-ide/brain/3f8edbd1-fbb0-42b2-9136-be0378a5378d/meme_ingame_screenshot.png';
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Saved screenshot to:', outPath);
  }

  ws.close();
  chromeProc.kill();
}

run().catch(console.error);
