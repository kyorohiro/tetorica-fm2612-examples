/** Shared native DSP: no AudioContext, AudioWorklet or DOM dependency. */
import { LiveFX } from './custom_fx.js';
declare const throwProcessError: (error: any) => never;
export declare class NativeFXEngine {
    sampleRate: any;
    liveFX: LiveFX;
    api: WebAssembly.Exports;
    capacity: any;
    gainRampFrames: number;
    noiseTokens: Map<any, any>;
    samples: {
        clear: () => void;
        reset: () => void;
        reserve: (d: any, performance: any) => number;
        startReserved: (id: any) => void;
        cancelReservation: (id: any) => void;
        stopOwner: (owner: any, session: any) => void;
        command(d: any): number | undefined;
    };
    units: Map<any, any>;
    ramps: Map<any, any>;
    beatSeconds: number;
    outputViews: Map<any, any>;
    input: Float32Array<any> | undefined;
    output: Float32Array<any> | undefined;
    outputLeft: any;
    outputRight: any;
    constructor(module: any, sampleRate: any);
    resetNoise(): void;
    reset(): void;
    command(d: any): void;
    apply({ type, slot, values: v }: {
        slot: any;
        type: any;
        values: any;
    }): void;
    process(source: any, target: any, onError: typeof throwProcessError | undefined, observe: any): void;
}
export {};
