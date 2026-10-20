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
    remote: any;
    playbackOwner: any;
    cancelledOwners: Set<any>;
    stoppedSessions: Set<any>;
    discardLeft: Float32Array<ArrayBuffer>;
    discardRight: Float32Array<ArrayBuffer>;
    eventEnabled: boolean;
    eventEpoch: number;
    eventSequence: number;
    eventIntervalFrames: number;
    eventFrames: number;
    eventCapacity: number;
    eventPool: any[];
    eventInFlight: Set<any>;
    eventPending: any;
    eventCount: number;
    eventLost: number;
    eventNeedsFinal: boolean;
    eventInitialPending: boolean;
    ready: Promise<void>;
    commands: Promise<void>;
    eventSuspended: boolean | undefined;
    resampler: SpcResampler | undefined;
    eventScratch: Float64Array<ArrayBuffer> | undefined;
    constructor({ processorOptions }?: {
        processorOptions?: {} | undefined;
    });
    enqueue(data: any, reply: any, owner?: null): void;
    receiveRpc(data: any, reply: any): void;
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
    resetObservation(epoch: any, reason: any): void;
    collectObservedEvents(): void;
    sendObservedEvents(force?: boolean, early?: boolean): void;
    command(data: any, reply?: any): void;
    fail(error: any): void;
    dispose(): void;
    process(_inputs: any, outputs: any): boolean;
}
