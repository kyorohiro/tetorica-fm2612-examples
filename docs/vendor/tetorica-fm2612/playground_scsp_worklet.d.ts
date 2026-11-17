declare class AudioWorkletProcessor { readonly port: MessagePort; }
import { ScspSynth } from './scspsynth.js';
import { Pcm44100Resampler } from './pcm_44100_resampler.js';
import { ScspVoiceInspector } from './playground_scsp_inspector.js';
export declare class ScspInstrumentProcessor extends AudioWorkletProcessor {
    dead: boolean;
    synth: ScspSynth | null;
    remote: any;
    workerRemote: any;
    revision: number;
    bankEpoch: number;
    fences: WeakMap<object, any>;
    validation: ScspSynth;
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
    ready: Promise<void>;
    inspector: ScspVoiceInspector;
    resampler: Pcm44100Resampler;
    constructor({ processorOptions }?: {
        processorOptions?: {} | undefined;
    });
    attach(port: any, worker: any): void;
    sendResources(port: any, resetPort: any, editedSlot: any): void;
    resourcesChanged(resetPort: any, editedSlot: any): void;
    receive(data: any, port: any): void;
    stopVoices(): void;
    apply({ method, args, id, resourceFence }: {
        args?: never[] | undefined;
        id: any;
        method: any;
        resourceFence: any;
    }, port: any, queued?: boolean): any;
    fail(error: any): void;
    dispose(): void;
    renderSegment(left: any, right: any): void;
    process(_inputs: any, outputs: any): boolean;
}
