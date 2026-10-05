import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve, sep, extname, join} from 'node:path';
import {root, copyRuntime} from './runtime.mjs';

const directory = join(root, 'public');
await copyRuntime(directory);
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript',
  '.css': 'text/css', '.wasm': 'application/wasm', '.json': 'application/json'};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const exampleAsset = pathname.startsWith('/examples/');
    const base = exampleAsset ? root : directory;
    const file = resolve(base, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    const allowed = exampleAsset ? [join(root, 'examples') + sep] : [directory + sep];
    if (!allowed.some(prefix => file.startsWith(prefix))) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    const data = await readFile(file);
    response.writeHead(200, {'Content-Type': types[extname(file)] ?? 'application/octet-stream'});
    response.end(data);
  } catch {
    response.writeHead(404).end('Not found');
  }
});
server.listen(Number(process.env.PORT ?? 5173), '127.0.0.1', () => {
  console.log(`Examples: http://127.0.0.1:${server.address().port}`);
});
