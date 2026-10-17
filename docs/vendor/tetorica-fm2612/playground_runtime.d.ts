/**
 * Create a reusable browser runtime with clocks, music helpers and execution lifecycle.
 * @param {{
 *   synth?: object | null,
 *   megaDrive?: object | null,
 *   chip?: "ym2612" | "ym2203" | "ym2608" | "ym2610",
 *   workletUrl?: string,
 *   audioWorkletUrl?: string,
 *   ym2612WasmUrl?: string,
 *   segaPsgWasmUrl?: string,
 *   presets?: Record<string, object>,
 *   logicWorkerUrl?: string | null,
 *   execution?: "main" | "worker",
 *   dacLookaheadSeconds?: number,
 *   workerLookaheadSeconds?: number,
 *   guardExecution?: boolean,
 *   onStatus?: ((message: string) => void) | null,
 *   onRuntimeState?: ((state: string) => void) | null,
 *   onLog?: ((line: string) => void) | null,
 *   onReady?: ((context: { synth: object, megaDrive: object }) => void) | null,
 *   onMegaDriveEvent?: ((event: object) => void) | null,
 *   onAuditionReset?: (() => void) | null,
 * }} [options]
 * @returns Runtime controls and accessors; initialize audio before using the synth.
 */
export declare function createPlaygroundRuntime(options?: {
    synth?: object | null;
    megaDrive?: object | null;
    chip?: "ym2612" | "ym2203" | "ym2608" | "ym2610";
    workletUrl?: string;
    audioWorkletUrl?: string;
    ym2612WasmUrl?: string;
    segaPsgWasmUrl?: string;
    presets?: Record<string, object>;
    logicWorkerUrl?: string | null;
    execution?: "main" | "worker";
    dacLookaheadSeconds?: number;
    workerLookaheadSeconds?: number;
    guardExecution?: boolean;
    onStatus?: ((message: string) => void) | null;
    onRuntimeState?: ((state: string) => void) | null;
    onLog?: ((line: string) => void) | null;
    onReady?: ((context: {
        synth: object;
        megaDrive: object;
    }) => void) | null;
    onMegaDriveEvent?: ((event: object) => void) | null;
    onAuditionReset?: (() => void) | null;
}): {
    mixer: any;
    chipInspector: {
        list: () => any;
        notify: () => void;
        subscribe(listener: any): () => boolean;
        read(id: any): Promise<any>;
        invoke(id: any, method: any, args?: any[]): Promise<any>;
        loadSample(id: any, source: any, options?: {}): Promise<any>;
        dispose(): void;
    };
    logicWorkerUrl: string;
    initialize: () => Promise<void>;
    ensureReady: ({ resumeOutput }?: {
        resumeOutput?: boolean | undefined;
    }) => Promise<any>;
    prepareAudition: () => Promise<any>;
    /** Host keyboard facade. Held notes take priority until release. */
    getAuditionSynth: () => {
        readonly clock: any;
        noteOn(channel: any, block: any, fnum: any): void;
        noteOff(channel: any): void;
    };
    load: (name: any, sourceCode: any) => void;
    put: (name: any, sourceCode: any) => void;
    get: (name: any) => any;
    play: (name: any, playOptions?: {}) => Promise<void>;
    playSource: (sourceCode: string, playOptions?: {
        execution?: "main" | "worker";
    }) => Promise<void>;
    stop: () => void;
    stopWithFade: () => any;
    clear: () => void;
    finalize: () => Promise<void>;
    getState: () => {
        chip: any;
        capabilities: any;
        audio: string;
        playback: string;
        currentSourceName: any;
        loadedSourceNames: any[];
    };
    setMasterVolume: (volume: any) => any;
    getMasterVolume: () => any;
    setTiming: (options: {
        lookaheadSeconds?: number;
        schedulerIntervalMs?: number;
        workerLookaheadSeconds?: number;
    }) => {
        lookaheadSeconds: number;
        schedulerIntervalMs: number;
        workerLookaheadSeconds: any;
    };
    getTiming: () => {
        lookaheadSeconds: number;
        schedulerIntervalMs: number;
        workerLookaheadSeconds: any;
    };
    setBpm(value: any): void;
    getBpm: () => number;
    readonly presets: {
        sine: {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "one-op-basic": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "two-op-bell": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "fm-bell": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "two-op-organ": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "four-op-brass": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "four-op-pad": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        coin: {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        laser: {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        hit: {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "ritual-bell": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "fm-bass": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "fm-pluck": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "fm-lead": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "fm-electric-piano": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
        "fm-strings": {
            label: string;
            algorithm: number;
            feedback: number;
            operators: {
                dt: number;
                multi: number;
                tl: number;
                ar: number;
                d1r: number;
                d2r: number;
                sl: number;
                rr: number;
            }[];
        };
    };
    readonly megaDrive: object;
    readonly capabilities: any;
    readonly fm: any;
    readonly psg: any;
    readonly sample: any;
    readonly stream: any;
    readonly noise: {
        create: (...args: unknown[]) => unknown;
        stopAll: () => void;
    } | {
        create(): never;
        stopAll(): void;
    };
    readonly context: {};
};
/**
 * Compatibility factory for createPlaygroundRuntime.
 * @param {Parameters<typeof createPlaygroundRuntime>[0]} [options]
 * @returns {ReturnType<typeof createPlaygroundRuntime>} Playground runtime.
 */
export declare function Playground(options?: Parameters<typeof createPlaygroundRuntime>[0]): ReturnType<typeof createPlaygroundRuntime>;
