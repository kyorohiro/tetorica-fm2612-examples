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
 *   guardExecution?: boolean,
 *   onStatus?: ((message: string) => void) | null,
 *   onRuntimeState?: ((state: string) => void) | null,
 *   onLog?: ((line: string) => void) | null,
 *   onReady?: ((context: { synth: object, megaDrive: object }) => void) | null,
 *   onMegaDriveEvent?: ((event: object) => void) | null,
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
    guardExecution?: boolean;
    onStatus?: ((message: string) => void) | null;
    onRuntimeState?: ((state: string) => void) | null;
    onLog?: ((line: string) => void) | null;
    onReady?: ((context: {
        synth: object;
        megaDrive: object;
    }) => void) | null;
    onMegaDriveEvent?: ((event: object) => void) | null;
}): {
    mixer: any;
    logicWorkerUrl: string;
    initialize: () => Promise<void>;
    ensureReady: ({ resumeOutput }?: {
        resumeOutput?: boolean | undefined;
    }) => Promise<any>;
    prepareAudition: () => Promise<any>;
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
    setTiming: (options: any) => {
        lookaheadSeconds: number;
        schedulerIntervalMs: number;
    };
    getTiming: () => {
        lookaheadSeconds: number;
        schedulerIntervalMs: number;
    };
    setBpm(value: any): void;
    getBpm: () => number;
    readonly presets: any;
    readonly megaDrive: any;
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
