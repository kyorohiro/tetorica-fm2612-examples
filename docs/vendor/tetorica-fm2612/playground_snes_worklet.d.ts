declare class AudioWorkletProcessor { readonly port: MessagePort; }
import { SnesSynth } from './snessynth.js';
import { SpcResampler } from './spc_resampler.js';
export declare class SnesInstrumentProcessor extends AudioWorkletProcessor {
    synth: SnesSynth | null;
    dead: boolean;
    remote: any;
    validation: SnesSynth;
    performance: {
        receive(data: any, port: any): boolean;
        render(left: any, right: any, render: any): void;
        clear: () => void;
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
    ready: Promise<void>;
    resampler: SpcResampler;
    constructor({ processorOptions }?: {
        processorOptions?: {} | undefined;
    });
    receive(data: any, port: any): void;
    apply({ method, args, id }: {
        args?: never[] | undefined;
        id: any;
        method: any;
    }, port: any, queued?: boolean): void;
    fail(error: any): void;
    dispose(): void;
    renderSegment(left: any, right: any): void;
    process(_inputs: any, outputs: any): boolean;
}
