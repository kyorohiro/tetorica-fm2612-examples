/**
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
    ensureReady: () => Promise<any>;
    load: (name: any, sourceCode: any) => void;
    put: (name: any, sourceCode: any) => void;
    get: (name: any) => any;
    play: (name: any, playOptions?: {}) => Promise<void>;
    playSource: (sourceCode: string, playOptions?: {
        execution?: "main" | "worker";
    }) => Promise<void>;
    stop: () => void;
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
    setTiming: (options: any) => any;
    getTiming: () => any;
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
    readonly noise: any;
    readonly context: {};
};
/**
 * @param {Parameters<typeof createPlaygroundRuntime>[0]} [options]
 */
export declare function Playground(options?: Parameters<typeof createPlaygroundRuntime>[0]): {
    mixer: any;
    logicWorkerUrl: string;
    initialize: () => Promise<void>;
    ensureReady: () => Promise<any>;
    load: (name: any, sourceCode: any) => void;
    put: (name: any, sourceCode: any) => void;
    get: (name: any) => any;
    play: (name: any, playOptions?: {}) => Promise<void>;
    playSource: (sourceCode: string, playOptions?: {
        execution?: "main" | "worker";
    }) => Promise<void>;
    stop: () => void;
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
    setTiming: (options: any) => any;
    getTiming: () => any;
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
    readonly noise: any;
    readonly context: {};
};
