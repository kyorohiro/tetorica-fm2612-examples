declare class AudioWorkletProcessor { readonly port: MessagePort; }
import { NativeFXEngine } from './native_fx_engine.js';
export declare class NativeFXProcessor extends AudioWorkletProcessor {
    engine: NativeFXEngine;
    active: boolean;
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
    constructor(options: any);
    observeFX: (name: any, input: any, output: any) => void;
    cancelMonitor(): void;
    get api(): WebAssembly.Exports;
    get liveFX(): import("./custom_fx.js").LiveFX;
    get samples(): {
        clear: () => void;
        reset: () => void;
        command(d: any): number | undefined;
    };
    get ramps(): Map<any, any>;
    get beatSeconds(): number;
    resetNoise(): void;
    reset(): void;
    receive(data: any): void;
    command(d: any): void;
    process(inputs: any, outputs: any): boolean;
}
