/** Resolve a shipped asset without importing browser-only runtime modules.
 * Browser bundlers must preserve/copy the package payload and may pass its public URL.
 * The returned URL is file: in Node, and HTTP(S) in a directly served browser module.
 * NES/FDS uses generated/nesapu_wasm.js and generated/nesapu_wasm.wasm.
 * SID cores accept wasmBinary explicitly. Their raw assets are
 * generated/sid/sid.wasm (6581) and
 * generated/sid8580-machine/sid8580-endpoint.wasm (PAL 8580 Preview).
 */
/** @param {string} path @param {string | URL} [baseUrl] @returns {URL} */
export declare function runtimeAssetUrl(path: string, baseUrl?: string | URL): URL;
