declare class AudioWorkletProcessor { readonly port: MessagePort; }
import { NativeFXEngine } from './native_fx_engine.js';
export declare class NativeFXProcessor extends AudioWorkletProcessor {
    engine: NativeFXEngine;
    active: boolean;
    emptySource: any[];
    reportError: (error: any) => any;
    renderFrame: number;
    segmentCapacity: number;
    segmentViews: Map<any, any>;
    noiseOwners: Map<any, any>;
    replyMain: (message: any) => any;
    performanceQueue: {
        receive(data: any, reply: any): boolean;
        nextFrame: () => any;
        advance(frame?: any): void;
        clear: () => void;
        cancelOwner: (owner: any, reply: any) => void;
        getStats: () => {
            activeSession: number;
            latestSession: number;
            queuedCommands: number;
            queuedBatches: number;
            lateCommands: number;
            maxLateFrames: number;
            rejectedBatches: number;
            discardedCommands: number;
        };
    };
    monitor: {
        id: any;
        name: any;
        names: any[];
        channel: number;
        input: Float32Array<ArrayBuffer>;
        output: Float32Array<ArrayBuffer>;
        offset: number;
    } | null;
    controlPort: any;
    segmentInput: Float32Array<any>[] | undefined;
    segmentOutput: Float32Array<any>[] | undefined;
    constructor(options: any);
    observeFX: (name: any, input: any, output: any) => void;
    cancelMonitor(): void;
    get api(): WebAssembly.Exports;
    get liveFX(): import("./custom_fx.js").LiveFX;
    get samples(): {
        clear: () => void;
        reset: () => void;
        reserve: (d: any, performance: any) => number;
        startReserved: (id: any) => void;
        cancelReservation: (id: any) => void;
        stopOwner: (owner: any, session: any) => void;
        command(d: any): number | undefined;
    };
    get ramps(): Map<any, any>;
    get beatSeconds(): number;
    resetNoise(): void;
    reset(): void;
    invalidatePerformance(): void;
    preparePerformanceCommand(command: any, reply: any, performance: any): any;
    receive(data: any, reply?: (message: any) => any): void;
    applyCommand(data: any, reply: ((message: any) => any) | undefined, performance: any): void;
    command(d: any): void;
    renderSegment(source: any, target: any, offset: any, count: any): void;
    process(inputs: any, outputs: any): boolean;
}
