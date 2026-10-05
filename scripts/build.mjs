import {cp, mkdir, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {root, copyRuntime} from './runtime.mjs';

const destination = join(root, 'dist');
await rm(destination, {recursive: true, force: true});
await mkdir(destination, {recursive: true});
await cp(join(root, 'public'), destination, {
  recursive: true,
  filter: path => path !== join(root, 'public/vendor'),
});
await copyRuntime(destination);
await cp(join(root, 'examples'), join(destination, 'examples'), {recursive: true});
console.log(`Static site ready: ${destination}`);
