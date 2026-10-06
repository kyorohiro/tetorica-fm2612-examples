import {cp, mkdir, readFile, rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));

export async function copyRuntime(destination) {
  const source = join(root, 'node_modules/tetorica-fm2612');
  const manifest = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
  const {version} = manifest;
  if (!manifest.exports?.['./node/transports']) {
    throw new Error('These basic examples require tetorica-fm2612 >= 0.2.6 with WorkletTransport / AudifyTransport. Run npm install to install the declared version.');
  }
  const target = join(destination, 'vendor/tetorica-fm2612');
  await mkdir(join(destination, 'vendor'), {recursive: true});
  await rm(target, {recursive: true, force: true});
  await cp(source, target, {recursive: true});
  console.log(`Copied installed tetorica-fm2612 ${version} (including WASM, Worklets and licenses).`);
}
