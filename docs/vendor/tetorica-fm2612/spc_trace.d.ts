import { SPC_TRACE_MAX_EVENTS } from './spc.js';
export declare const SPC_TRACE_MAX_SECONDS = 600;
export { SPC_TRACE_MAX_EVENTS };
/** Execute a bounded SPC interval offline. Events retain the native DSP clock;
 * no AudioContext, BPM, output sample-rate conversion or audio playback is used.
 * @param {ArrayBuffer|ArrayBufferView} bytes
 * @param {{durationSeconds:number,moduleFactory:import('./spc.js').SpcCoreOptions['moduleFactory'],
 * moduleOptions?:import('./spc.js').SpcCoreOptions['moduleOptions'],
 * signal?:AbortSignal,onProgress?:(progress:{stage:'analyze'|'record',renderedSeconds:number,durationSeconds:number,ratio:number})=>void,
 * maxEvents?:number}} options
 */
export declare function captureSpcTrace(bytes: ArrayBuffer | ArrayBufferView, { durationSeconds, moduleFactory, moduleOptions, signal, onProgress, maxEvents }?: {
    durationSeconds: number;
    moduleFactory: import('./spc.js').SpcCoreOptions['moduleFactory'];
    moduleOptions?: import('./spc.js').SpcCoreOptions['moduleOptions'];
    signal?: AbortSignal;
    onProgress?: (progress: {
        stage: 'analyze' | 'record';
        renderedSeconds: number;
        durationSeconds: number;
        ratio: number;
    }) => void;
    maxEvents?: number;
}): Promise<{
    version: 1;
    clockRate: 1024000;
    durationClocks: number;
    initialState: {
        ram: Uint8Array;
        dsp: Uint8Array;
        outputDelayFrames: 4;
    };
    events: Uint32Array<ArrayBufferLike> | (number[] & Uint32Array<ArrayBufferLike>);
    optimization: {
        kind: string;
        ramReadAddresses: number;
        dspEvents: number;
        ramEvents: number;
    };
}>;
