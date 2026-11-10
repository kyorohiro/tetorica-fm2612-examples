export type DefaultCodeSoundChip = 'ym2612' | 'segapsg' | 'rf5c164' | 'pwm';
/** @typedef {'ym2612'|'segapsg'|'rf5c164'|'pwm'} DefaultCodeSoundChip */
/** @type {readonly DefaultCodeSoundChip[]} */
export declare const CODE_SOUND_CHIPS: readonly DefaultCodeSoundChip[];
export type PlaygroundCodeRuntimeState = {
    state: string;
    playback: string;
    running: boolean;
    stopping: boolean;
    busy: boolean;
    status: string;
    path: string;
    bpm: number;
    loopNames: string[];
    error?: unknown;
};
export type PlaygroundCodeRuntimeOptions<ChipName extends string = DefaultCodeSoundChip> = {
    /**
     * Prepare the injected audio owner before evaluating user code; may return a promise.
     */
    ensureReady: () => unknown;
    /**
     * Audio clock in seconds.
     */
    now: () => number;
    /**
     * Borrow a supported chip client.
     */
    useSoundChip: (name: ChipName) => object | Promise<object>;
    /**
     * Host-owned chip IDs; defaults to the four Genesis instruments.
     */
    supportedSoundChips?: readonly ChipName[];
    /**
     * Current FM compatibility client.
     */
    getFm?: () => object | null;
    /**
     * Effect factories and live-effect controls owned by the host.
     */
    fx?: object;
    /**
     * Read a virtual file; may return a promise.
     */
    readFile?: (path: string, options: object, entry: {
        path: string;
    }) => unknown;
    /**
     * Resolve virtual modules before execution.
     */
    prepareSource?: (source: string, options: {
        path: string;
    }) => string | Promise<string>;
    onLog?: (line: string) => void;
    onState?: (state: PlaygroundCodeRuntimeState) => void;
    /**
     * Await the host output fade before releasing notes/resources.
     */
    beforeStopSoundChips?: () => unknown;
    /**
     * Stop the borrowed chips; may return a promise.
     */
    stopSoundChips?: () => unknown;
    guardExecution?: boolean;
    /**
     * Realm whose user-code network/navigation guards are installed temporarily.
     */
    realm?: object;
    setTimer?: typeof globalThis.setTimeout;
    clearTimer?: typeof globalThis.clearTimeout;
    /**
     * Optional task dispatch hook; null uses timer dispatch.
     */
    createTaskChannel?: () => MessageChannel | null;
};
/**
 * @typedef {Object} PlaygroundCodeRuntimeState
 * @property {string} state
 * @property {string} playback
 * @property {boolean} running
 * @property {boolean} stopping
 * @property {boolean} busy
 * @property {string} status
 * @property {string} path
 * @property {number} bpm
 * @property {string[]} loopNames
 * @property {unknown} [error]
 */
/**
 * @template {string} [ChipName=DefaultCodeSoundChip]
 * @typedef {Object} PlaygroundCodeRuntimeOptions
 * @property {()=>unknown} ensureReady Prepare the injected audio owner before evaluating user code; may return a promise.
 * @property {()=>number} now Audio clock in seconds.
 * @property {(name:ChipName)=>object|Promise<object>} useSoundChip Borrow a supported chip client.
 * @property {readonly ChipName[]} [supportedSoundChips] Host-owned chip IDs; defaults to the four Genesis instruments.
 * @property {()=>object|null} [getFm] Current FM compatibility client.
 * @property {object} [fx] Effect factories and live-effect controls owned by the host.
 * @property {(path:string,options:object,entry:{path:string})=>unknown} [readFile] Read a virtual file; may return a promise.
 * @property {(source:string,options:{path:string})=>string|Promise<string>} [prepareSource] Resolve virtual modules before execution.
 * @property {(line:string)=>void} [onLog]
 * @property {(state:PlaygroundCodeRuntimeState)=>void} [onState]
 * @property {()=>unknown} [beforeStopSoundChips] Await the host output fade before releasing notes/resources.
 * @property {()=>unknown} [stopSoundChips] Stop the borrowed chips; may return a promise.
 * @property {boolean} [guardExecution]
 * @property {object} [realm] Realm whose user-code network/navigation guards are installed temporarily.
 * @property {typeof globalThis.setTimeout} [setTimer]
 * @property {typeof globalThis.clearTimeout} [clearTimer]
 * @property {()=>MessageChannel|null} [createTaskChannel] Optional task dispatch hook; null uses timer dispatch.
 */
/**
 * Main-thread live code execution, with an injected audio owner. ensureReady
 * prepares providers before user guards run; readFile / prepareSource bridge
 * the host's virtual files using the existing Playground file helpers.
 * @template {string} [ChipName=DefaultCodeSoundChip]
 * @param {PlaygroundCodeRuntimeOptions<ChipName>} options
 */
export declare function createPlaygroundCodeRuntime<ChipName extends string = DefaultCodeSoundChip>({ ensureReady, now, useSoundChip, supportedSoundChips, getFm, fx, readFile, prepareSource, onLog, onState, beforeStopSoundChips, stopSoundChips, guardExecution, realm, setTimer, clearTimer, createTaskChannel, }?: PlaygroundCodeRuntimeOptions<ChipName>): {
    run: (source: any, options?: {}) => Promise<{
        state: string;
        playback: string;
        running: boolean;
        stopping: boolean;
        busy: boolean;
        status: string;
        path: string;
        bpm: number;
        loopNames: any[];
        error?: any;
    }>;
    apply: (source: any, options?: {}) => Promise<{
        state: string;
        playback: string;
        running: boolean;
        stopping: boolean;
        busy: boolean;
        status: string;
        path: string;
        bpm: number;
        loopNames: any[];
        error?: any;
    }>;
    stop(): Promise<{
        state: string;
        playback: string;
        running: boolean;
        stopping: boolean;
        busy: boolean;
        status: string;
        path: string;
        bpm: number;
        loopNames: any[];
        error?: any;
    }>;
    getState: () => {
        state: string;
        playback: string;
        running: boolean;
        stopping: boolean;
        busy: boolean;
        status: string;
        path: string;
        bpm: number;
        loopNames: any[];
        error?: any;
    };
    getContext: () => {};
};
