/** One PCM source on the existing AudioContext; it never creates a second clock.
 * The main thread prepares/transfers PCM16; the Worklet renders from those bytes.
 * @param {AudioContext} context
 * @param {{signal?:AbortSignal,onError?:(error:Error)=>void,fetch?:typeof globalThis.fetch,workletUrl?:string|URL,wasmUrl?:string|URL}} [options]
 */
export declare function createCddaAudio(context: AudioContext, { signal, onError, fetch: fetcher, workletUrl, wasmUrl }?: {
    signal?: AbortSignal;
    onError?: (error: Error) => void;
    fetch?: typeof globalThis.fetch;
    workletUrl?: string | URL;
    wasmUrl?: string | URL;
}): Promise<{
    node: AudioWorkletNode;
    prepare(pcm: any, track: any, { signal: operationSignal }?: {}): Promise<void>;
    /** @param {object} action @param {{at?:number}} [timing] */
    command(action: object, { at }?: {
        at?: number;
    }): Promise<any>;
    dispose: () => void;
}>;
