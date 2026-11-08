declare class AudioWorkletProcessor { readonly port: MessagePort; }
import { Ps1Synth } from './ps1synth.js';
import { Ps1Resampler } from './ps1_resampler.js';
import { Ps1VoiceInspector } from './playground_ps1_inspector.js';
export declare class Ps1InstrumentProcessor extends AudioWorkletProcessor {
    synth: Ps1Synth | null;
    dead: boolean;
    remote: any;
    workerRemote: any;
    resourceRevision: number;
    bankEpoch: number;
    resourceFences: WeakMap<object, any>;
    validation: Ps1Synth;
    performance: {
        receive(data: any, port: any): boolean;
        render(left: any, right: any, render: any): void;
        beginAudition(channel: any, owner: any): void;
        endAudition(channel: any, owner: any): void;
        applyImmediate(command: any, port: any, metadata: any): boolean | undefined;
        clear(): void;
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
    inspector: Ps1VoiceInspector;
    resampler: Ps1Resampler;
    constructor({ processorOptions }?: {
        processorOptions?: {} | undefined;
    });
    receive(data: any, port: any): void;
    sendResources(port: any): void;
    resourcesChanged(): void;
    stopVoices(): void;
    apply({ method, args, id, resourceFence }: {
        args?: never[] | undefined;
        id: any;
        method: any;
        resourceFence: any;
    }, port: any, queued?: boolean): void;
    fail(error: any): void;
    dispose(): void;
    renderSegment(left: any, right: any): void;
    process(_inputs: any, outputs: any): boolean;
}
