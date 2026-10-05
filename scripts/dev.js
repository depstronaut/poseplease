import { spawn } from 'child_process';

console.log('🚀 Starting PosePlease Multiplayer Monorepo (Web + Server)...');

// Spawn Server
const serverProc = spawn('npm', ['run', 'dev', '--workspace=@poseplease/server'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

serverProc.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[36m[SERVER]\x1b[0m ${data}`);
});

serverProc.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[31m[SERVER ERR]\x1b[0m ${data}`);
});

// Spawn Web
const webProc = spawn('npm', ['run', 'dev', '--workspace=@poseplease/web'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
});

webProc.stdout.on('data', (data) => {
  process.stdout.write(`\x1b[35m[WEB]\x1b[0m ${data}`);
});

webProc.stderr.on('data', (data) => {
  process.stderr.write(`\x1b[33m[WEB ERR]\x1b[0m ${data}`);
});

// Clean shutdown on exit
function shutdown() {
  console.log('\n🛑 Shutting down PosePlease dev processes...');
  try { serverProc.kill(); } catch {}
  try { webProc.kill(); } catch {}
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
