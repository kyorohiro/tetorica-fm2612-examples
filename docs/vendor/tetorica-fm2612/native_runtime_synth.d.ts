import { createPokeyClient } from './playground_pokey.js';
import { createAy8910Client } from './playground_ay8910.js';
import { TetoricaAudioRuntime } from './tetorica_audio_runtime.js';
import { createNesClient } from './playground_nes.js';
import { createSnesClient } from './playground_snes.js';
import { createYm2151Client } from './playground_ym2151.js';
import { createOki6258Client } from './playground_okim6258.js';
import { createHuc6280Client } from './playground_huc6280.js';
import { createSegaPsgClient } from './playground_segapsg.js';
import { createYm2413Client } from './playground_ym2413.js';
import { createOplClient } from './playground_opl.js';
import { createDx7Client } from './playground_dx7.js';
export type NativeRuntimeSynthOptions = Pick<import('./megasynth.js').MegaSynthOptions, 'audioContext' | 'outputNode' | 'sampleOutputNode' | 'masterVolume' | 'mixer'> & {
    chip?: 'nes' | 'snes' | 'x68000' | 'huc6280' | 'pokey' | 'wonderswan' | 'segapsg' | 'dx7' | 'ym3526' | 'ym3812' | 'y8950' | 'ymf262' | 'ym2413' | 'ay8910' | 'msx' | 'msx-audio';
    ym2413?: boolean;
    clock?: number;
    stereoEnabled?: boolean;
    fds?: boolean;
    type?: 0 | 16;
    flags?: number;
    dualPokey?: boolean;
    mixerId?: string;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
    fetch?: typeof globalThis.fetch;
    ayOptions?: {
        fetch?: typeof globalThis.fetch;
        wasmUrl?: string | URL;
        workletUrl?: string | URL;
    };
    oplOptions?: {
        fetch?: typeof globalThis.fetch;
        wasmUrl?: string | URL;
        workletUrl?: string | URL;
    };
    opllOptions?: {
        fetch?: typeof globalThis.fetch;
        wasmUrl?: string | URL;
        workletUrl?: string | URL;
    };
    extraOki?: {
        fetch?: typeof globalThis.fetch;
        wasmUrl?: string | URL;
        workletUrl?: string | URL;
    };
};
/** @typedef {Pick<import('./megasynth.js').MegaSynthOptions,'audioContext'|'outputNode'|'sampleOutputNode'|'masterVolume'|'mixer'> & {
 * chip?:'nes'|'snes'|'x68000'|'huc6280'|'pokey'|'wonderswan'|'segapsg'|'dx7'|'ym3526'|'ym3812'|'y8950'|'ymf262'|'ym2413'|'ay8910'|'msx'|'msx-audio', ym2413?:boolean, clock?:number, stereoEnabled?:boolean, fds?:boolean,
 * type?:0|16, flags?:number, dualPokey?:boolean, mixerId?:string,
 * wasmUrl?:string|URL, workletUrl?:string|URL, fetch?:typeof globalThis.fetch,
 * ayOptions?:{fetch?:typeof globalThis.fetch,wasmUrl?:string|URL,workletUrl?:string|URL},
 * oplOptions?:{fetch?:typeof globalThis.fetch,wasmUrl?:string|URL,workletUrl?:string|URL},
 * opllOptions?:{fetch?:typeof globalThis.fetch,wasmUrl?:string|URL,workletUrl?:string|URL},
 * extraOki?:{fetch?:typeof globalThis.fetch,wasmUrl?:string|URL,workletUrl?:string|URL}
 * }} NativeRuntimeSynthOptions */
/**
 * Constructing this runtime opens no audio device and loads no WASM.
 * Every endpoint owns its Main-thread client port. A Worker may connect a
 * separate port through endpoint.node, keeping resource requests independent.
 */
export declare class NativeRuntimeSynth {
    #private;
    chip: string;
    options: NativeRuntimeSynthOptions;
    capabilities: Readonly<{
        chip: string;
        fmChannels: 0;
        psg: boolean;
        dac: false;
        recorder: false;
    }>;
    audio: TetoricaAudioRuntime;
    node: any;
    fm: any;
    psg: any;
    /** @type {{nes?:ReturnType<typeof createNesClient>,snes?:ReturnType<typeof createSnesClient>,opm?:ReturnType<typeof createYm2151Client>,adpcm?:ReturnType<typeof createOki6258Client>,pce?:ReturnType<typeof createHuc6280Client>,psg?:ReturnType<typeof createSegaPsgClient>,dx7?:ReturnType<typeof createDx7Client>,opl?:ReturnType<typeof createOplClient>,opll?:ReturnType<typeof createYm2413Client>,ay?:ReturnType<typeof createAy8910Client>,pokey?:ReturnType<typeof createPokeyClient>,pokey2?:ReturnType<typeof createPokeyClient>}} */
    primaryApis: {
        nes?: ReturnType<typeof createNesClient>;
        snes?: ReturnType<typeof createSnesClient>;
        opm?: ReturnType<typeof createYm2151Client>;
        adpcm?: ReturnType<typeof createOki6258Client>;
        pce?: ReturnType<typeof createHuc6280Client>;
        psg?: ReturnType<typeof createSegaPsgClient>;
        dx7?: ReturnType<typeof createDx7Client>;
        opl?: ReturnType<typeof createOplClient>;
        opll?: ReturnType<typeof createYm2413Client>;
        ay?: ReturnType<typeof createAy8910Client>;
        pokey?: ReturnType<typeof createPokeyClient>;
        pokey2?: ReturnType<typeof createPokeyClient>;
    };
    /** @type {ReturnType<typeof createNesClient>|null} */ nes: ReturnType<typeof createNesClient> | null;
    /** @type {ReturnType<typeof createSnesClient>|null} */ snes: ReturnType<typeof createSnesClient> | null;
    /** @type {ReturnType<typeof createYm2151Client>|null} */ opm: ReturnType<typeof createYm2151Client> | null;
    /** @type {ReturnType<typeof createOki6258Client>|null} */ adpcm: ReturnType<typeof createOki6258Client> | null;
    /** @type {ReturnType<typeof createHuc6280Client>|null} */ pce: ReturnType<typeof createHuc6280Client> | null;
    ws: any;
    pokey: any;
    pokey2: any;
    /** @type {ReturnType<typeof createDx7Client>|null} */ dx7: ReturnType<typeof createDx7Client> | null;
    /** @type {ReturnType<typeof createOplClient>|null} */ opl: ReturnType<typeof createOplClient> | null;
    /** @type {ReturnType<typeof createYm2413Client>|null} */ opll: ReturnType<typeof createYm2413Client> | null;
    /** @type {ReturnType<typeof createAy8910Client>|null} */ ay: ReturnType<typeof createAy8910Client> | null;
    primaryEndpoints: any[];
    listeners: Set<any>;
    readyPromise: Promise<void> | null;
    closePromise: Promise<void> | null;
    initializationController: AbortController | null;
    state: string;
    noise: {
        create: (options?: {}) => any;
        stopAll: () => void;
    };
    /** @param {NativeRuntimeSynthOptions} [options] */
    constructor(options?: NativeRuntimeSynthOptions);
    get mixer(): import("./soundchip_mixer.js").SoundChipMixer;
    get audioContext(): AudioContext | null;
    set audioContext(value: AudioContext | null);
    get ownsAudioContext(): boolean;
    get sample(): any;
    get stream(): any;
    start(): Promise<this>;
    resume(): Promise<void>;
    suspend(): Promise<void>;
    isReady(): boolean;
    isStarting(): boolean;
    addListener(listener: any): () => boolean;
    removeListener(listener: any): void;
    setMasterVolume(volume: any): number;
    getMasterVolume(): number;
    setFXChain(effects?: any[], options?: {}): any;
    getFXChain(): any;
    clearFXChain(options?: {}): any;
    connect(effect: any): this;
    connectOutput(node?: null): this;
    /** Stop voices while keeping uploaded samples, patches, waveforms and clocks. */
    stopAllNative(): Promise<void> | undefined;
    reset(): void;
    close(): Promise<void>;
}
