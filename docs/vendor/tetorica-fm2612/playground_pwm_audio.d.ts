/** Commands travel directly from Main or logic Worker to the PWM AudioWorklet. */
/** @param {AudioContext} context
 * @param {AudioNode} destination
 * @param {{signal?:AbortSignal,clock?:number,gain?:number,outputMode?:'dac'|'duty',implementation?:'wasm'|'js',wasmBinary?:Uint8Array|ArrayBuffer,fetch?:typeof fetch}} [options] */
export declare function createPWM32XAudio(context: AudioContext, destination: AudioNode, options?: {
    signal?: AbortSignal;
    clock?: number;
    gain?: number;
    outputMode?: 'dac' | 'duty';
    implementation?: 'wasm' | 'js';
    wasmBinary?: Uint8Array | ArrayBuffer;
    fetch?: typeof fetch;
}): Promise<{
    node: AudioWorkletNode;
    port: MessagePort;
    dispose(): void;
}>;
