declare class AudioWorkletProcessor { readonly port: MessagePort; }
import { SpcCore } from './spc.js';
import { SpcResampler } from './spc_resampler.js';
/** Whole-machine SPC playback. No main-thread synthesis or musical/BPM clock. */
export declare class SpcProcessor extends AudioWorkletProcessor {
    core: SpcCore | null;
    loaded: boolean;
    playing: boolean;
    disposed: boolean;
    failed: boolean;
    muteMask: number;
    seekId: any;
    discardLeft: Float32Array<ArrayBuffer>;
    discardRight: Float32Array<ArrayBuffer>;
    ready: Promise<void>;
    commands: Promise<void>;
    resampler: SpcResampler | undefined;
    constructor({ processorOptions }?: {
        processorOptions?: {} | undefined;
    });
    initialize(wasmBinary: any): Promise<void>;
    state(): {
        ready: boolean;
        loaded: boolean;
        playing: boolean;
        paused: boolean;
        muteMask: number;
        sampleRate: any;
        nativeSampleRate: number;
        playbackNativeFrames: number;
        positionSeconds: number;
        renderedNativeFrames: number;
    };
    requireLoaded(): void;
    command(data: any): void;
    fail(error: any): void;
    dispose(): void;
    process(_inputs: any, outputs: any): boolean;
}
