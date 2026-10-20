export declare const SPC_PERFORMANCE_MAX_EVENTS = 20000;
/** Capture an editable approximation of SPC performance, without retaining CPU
 * RAM writes or a raw DSP log. Notes keep their key times; optional control
 * sampling keeps the last value in each interval (no interpolation). BRR is
 * observed at note/sample changes, at the end of a 128-frame native block.
 * This cannot restore an already-running envelope, echo RAM, or later BRR edits.
 * @param {ArrayBuffer|ArrayBufferView} bytes
 * @param {{durationSeconds:number,moduleFactory:import('./spc.js').SpcCoreOptions['moduleFactory'],
 * moduleOptions?:import('./spc.js').SpcCoreOptions['moduleOptions'],controlStepMs?:number,
 * signal?:AbortSignal,onProgress?:(progress:{stage:string,renderedSeconds:number,durationSeconds:number,ratio:number})=>void,
 * maxEvents?:number}} options
 */
export declare function captureSpcPerformance(bytes: ArrayBuffer | ArrayBufferView, { durationSeconds, moduleFactory, moduleOptions, controlStepMs, signal, onProgress, maxEvents }?: {
    durationSeconds: number;
    moduleFactory: import('./spc.js').SpcCoreOptions['moduleFactory'];
    moduleOptions?: import('./spc.js').SpcCoreOptions['moduleOptions'];
    controlStepMs?: number;
    signal?: AbortSignal;
    onProgress?: (progress: {
        stage: string;
        renderedSeconds: number;
        durationSeconds: number;
        ratio: number;
    }) => void;
    maxEvents?: number;
}): Promise<{
    version: number;
    clockRate: number;
    durationClocks: number;
    controlStepMs: number;
    initialDsp: Uint8Array<ArrayBuffer>;
    events: any[];
    samples: any[];
    warnings: string[];
    statistics: {
        rawWrites: number;
        interpretedEvents: number;
        eventCount: number;
        controlsOmitted: number;
        sampleCount: number;
        sampleBytes: number;
        controlStepMs: number;
    };
}>;
