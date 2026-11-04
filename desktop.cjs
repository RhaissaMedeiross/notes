// Opens a dedicated app window on Windows, using an existing server when possible.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) { console.error('PORT deve ser uma porta válida.'); process.exit(1); }
const url = `http://localhost:${port}`;
function probe() {
  return new Promise(resolve => {
    const request = http.get(`${url}/manifest.webmanifest`, response => {
      let data = ''; response.on('data', chunk => { data += chunk; });
      response.on('end', () => { try { resolve(response.statusCode === 200 && JSON.parse(data).name === 'Meu caderno — Study Studio'); } catch { resolve(false); } });
    });
    request.setTimeout(800, () => request.destroy()); request.on('error', () => resolve(false));
  });
}
function openWindow() {
  let command, args;
  if (process.platform === 'win32') {
    const roots = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
    const candidates = roots.flatMap(root => ['Microsoft/Edge/Application/msedge.exe', 'Google/Chrome/Application/chrome.exe'].map(file => path.join(root, file)));
    command = candidates.find(file => fs.existsSync(file));
    if (command) args = [`--app=${url}`, '--new-window'];
    else { command = process.env.ComSpec || 'cmd.exe'; args = ['/d', '/s', '/c', `start "" "${url}"`]; }
  } else { command = process.platform === 'darwin' ? 'open' : 'xdg-open'; args = [url]; }
  const browser = spawn(command, args, { detached: true, stdio: 'ignore' });
  browser.on('error', () => console.log(`Abra ${url} no navegador.`)); browser.unref();
}
(async () => {
  if (await probe()) { openWindow(); return; }
  const server = spawn(process.execPath, [path.join(__dirname, 'server.js')], { stdio: 'inherit', env: { ...process.env, PORT: String(port) } });
  let failed = false;
  server.on('error', error => { failed = true; console.error('Não foi possível iniciar o caderno:', error.message); });
  server.on('exit', code => { failed = true; if (code) process.exitCode = code; });
  const stop = () => { server.kill(); process.exit(); };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
  for (let attempt = 0; attempt < 30 && !failed; attempt++) {
    if (await probe()) { console.log('Caderno aberto! Mantenha esta janela aberta enquanto estuda.'); openWindow(); return; }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!failed) server.kill();
  console.error('Não foi possível abrir o app. Confira se a porta está livre ou use outra PORT.');
  process.exitCode = 1;
})();
