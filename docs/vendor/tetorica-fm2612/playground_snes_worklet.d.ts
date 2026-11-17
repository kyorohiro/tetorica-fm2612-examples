declare class AudioWorkletProcessor { readonly port: MessagePort; }
import { SnesSynth } from './snessynth.js';
import { SpcResampler } from './spc_resampler.js';
import { SnesVoiceInspector } from './playground_snes_inspector.js';
export declare class SnesInstrumentProcessor extends AudioWorkletProcessor {
    synth: SnesSynth | null;
    dead: boolean;
    remote: any;
    timelineCompletion: {
        id: any;
        port: any;
    } | null;
    validation: SnesSynth;
    performance: {
        receive(data: any, port: any): boolean;
        render(left: any, right: any, render: any): void;
        beginAudition(channel: any, owner: any): void;
        endAudition(channel: any, owner: any): void;
        applyImmediate(command: any, port: any, metadata: any): boolean | undefined;
        schedulePattern: (spec: any, reply: any) => {
            name: any;
            startFrame: any;
            sampleRate: any;
            entries: any;
            repeatSeconds: any;
        };
        validatePattern: (spec: any) => {
            name: any;
            entries: {
                offsetSeconds: any;
                command: any;
            }[];
            repeatSeconds: any;
            startFrame: number;
            cost: number;
            performance: {
                session: any;
                owner: any;
                time: any;
            };
        };
        clearPattern: (name: string, { session, owner }?: {
            session?: number;
            owner?: string;
        }) => boolean;
        commitPatterns: (changes: any, { session, owner, dryRun }?: {
            session: number;
            owner: string;
            dryRun?: boolean;
        }, reply?: (message: any) => void) => {
            session: number;
            owner: string;
            reservations: {
                name: any;
                startFrame: any;
                sampleRate: any;
                entries: any;
                repeatSeconds: any;
            }[];
            cleared: any[];
        };
        cancelPatternOwner: (owner: string, { session }?: {
            session?: number;
        }) => boolean;
        cancelOwner: (owner: any, reply: any) => void;
        nowFrame: () => any;
        clear(): void;
        getStats: () => {
            activeSession: number;
            latestSession: number;
            queuedCommands: number;
            queuedBatches: number;
            patternCount: number;
            storedPatternCommands: number;
            patternRate: number;
            storedPatternCost: number;
            patternCostRate: number;
            lateCommands: number;
            maxLateFrames: number;
            rejectedBatches: number;
            discardedCommands: number;
        };
    };
    workerRemote: any;
    ready: Promise<void>;
    inspector: SnesVoiceInspector;
    instrumentResampler: SpcResampler;
    timelineResampler: SpcResampler;
    resampler: SpcResampler;
    constructor({ processorOptions }?: {
        processorOptions?: {} | undefined;
    });
    receive(data: any, port: any): void;
    stopVoices(): void;
    apply({ method, args, id }: {
        args?: never[] | undefined;
        id: any;
        method: any;
    }, port: any, queued?: boolean): void;
    finishTimeline(message: any): void;
    fail(error: any): void;
    dispose(): void;
    renderSegment(left: any, right: any): void;
    process(_inputs: any, outputs: any): boolean;
}
