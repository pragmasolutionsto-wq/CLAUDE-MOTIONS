// uso: node farmacia/stills.mjs FarmaciaH 30,150,300  -> out/still_<comp>_<frame>.png
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [comp = 'FarmaciaH', list = '0'] = process.argv.slice(2);
const B = process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('farmacia/index.ts'), publicDir: path.resolve('farmacia/public')});
const opts = {browserExecutable: B, chromeMode: 'headless-shell', logLevel: 'error'};
const composition = await selectComposition({serveUrl, id: comp, ...opts});
for (const f of list.split(',').map(Number)) {
  await renderStill({composition, serveUrl, frame: f, output: `out/still_${comp}_${f}.png`, ...opts});
  console.log('ok', f);
}
