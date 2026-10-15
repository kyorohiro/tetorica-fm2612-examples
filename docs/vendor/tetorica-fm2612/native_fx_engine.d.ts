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
        command(d: any): number | undefined;
    };
    units: Map<any, any>;
    ramps: Map<any, any>;
    beatSeconds: number;
    input: Float32Array<any> | undefined;
    output: Float32Array<any> | undefined;
    outputLeft: Float32Array<any> | null | undefined;
    outputRight: Float32Array<any> | undefined;
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
