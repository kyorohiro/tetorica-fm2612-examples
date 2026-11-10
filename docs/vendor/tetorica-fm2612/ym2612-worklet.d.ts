declare class AudioWorkletProcessor { readonly port: MessagePort; }
import { OpnKeyboardInspector } from './playground_opn_inspector.js';
import { PsgInspectorState } from './playground_chip_inspector_state.js';
import { YM2612DacPlayer } from "./ym2612_dac.js";
import { SegaPSG } from "./segapsg.js";
export declare class YM2612Processor extends AudioWorkletProcessor {
    ym2612: import("./ym2612.js").Ym2612 | null;
    auditions: {
        handle(command: any): boolean;
    } | null;
    psg: SegaPSG | null;
    initializing: boolean;
    resampleRemainder: number;
    lastLeft: number;
    lastRight: number;
    psgRemainder: number;
    psgLeft: number;
    psgRight: number;
    idleLeft: number;
    idleRight: number;
    mixTargets: {
        ym2612: number[];
        segapsg: number[];
    };
    mixCurrent: {
        ym2612: number[];
        segapsg: number[];
    };
    mixRemaining: {
        ym2612: number;
        segapsg: number;
    };
    mixMeterEnabled: {
        ym2612: boolean;
        segapsg: boolean;
    };
    mixMeterPeaks: Float32Array<ArrayBuffer>;
    mixMeterFrames: number;
    pendingCommands: any[];
    scheduledCommands: any[];
    scheduledHead: number;
    dacBanks: Map<any, any>;
    dacStreams: any[];
    pcmDac: YM2612DacPlayer;
    envelopeEnabled: boolean;
    envelopeRmsBuckets: Float32Array<ArrayBuffer>;
    envelopeOffset: number;
    envelopeFrames: number;
    envelopeSum: number;
    envelopeBucketSize: number;
    envelopeMessageSize: number;
    captureActive: boolean;
    captureId: any;
    captureLeftChunks: any[];
    captureRightChunks: any[];
    captureFrameCount: number;
    performanceOwnership: {
        observe(command: any, performance: any): void;
        cancel(owner: any): void;
        reset: () => void;
    };
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
    performanceDacOwner: any;
    opnInspector: OpnKeyboardInspector | undefined;
    psgInspector: PsgInspectorState | undefined;
    psgAuditions: {
        begin(channel: any, owner: any): void;
        end(channel: any, owner: any): void;
        apply(command: any, owner: any): unknown;
        clear(): void;
    } | undefined;
    clock: number | undefined;
    constructor();
    init(wasmBinary: any, psgWasmBinary: any): Promise<void>;
    preparePerformanceCommand(command: any, reply: any, performance: any): any;
    applyCommand(command: any, reply: ((message: any) => any) | undefined, commandFrame: any, performance: any): void;
    process(inputs: any, outputs: any): boolean;
    nextDacFrame(): number;
    writeDueDacFrames(frame: any): void;
    dacSampleOffsetToFrame(stream: any, sampleOffset: any): any;
    renderFrames(leftOut: any, rightOut: any, offset: any, frames: any): void;
    flushMixerMeters(frames: any): void;
    captureOutputEnvelope(left: any, right: any): void;
    capturePcm(left: any, right: any): void;
    flushCapture(): void;
}
