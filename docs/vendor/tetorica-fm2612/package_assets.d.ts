/** Resolve a shipped asset without importing browser-only runtime modules.
 * Browser bundlers must preserve/copy the package payload and may pass its public URL.
 * The returned URL is file: in Node, and HTTP(S) in a directly served browser module.
 */
/** @param {string} path @param {string | URL} [baseUrl] @returns {URL} */
export declare function runtimeAssetUrl(path: string, baseUrl?: string | URL): URL;
