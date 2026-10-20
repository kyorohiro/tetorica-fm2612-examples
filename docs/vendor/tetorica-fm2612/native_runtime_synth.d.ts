/** Primary non-OPN machines share media, mixer and FX without a hidden FM synth. */
import { TetoricaAudioRuntime } from './tetorica_audio_runtime.js';
import { createNesClient } from './playground_nes.js';
import { createSnesClient } from './playground_snes.js';
import { createYm2151Client } from './playground_ym2151.js';
import { createOki6258Client } from './playground_okim6258.js';
import { createHuc6280Client } from './playground_huc6280.js';
import { createSegaPsgClient } from './playground_segapsg.js';
export type NativeRuntimeSynthOptions = Pick<import('./megasynth.js').MegaSynthOptions, 'audioContext' | 'outputNode' | 'sampleOutputNode' | 'masterVolume' | 'mixer'> & {
    chip?: 'nes' | 'snes' | 'x68000' | 'huc6280' | 'segapsg';
    clock?: number;
    stereoEnabled?: boolean;
    fds?: boolean;
    wasmUrl?: string | URL;
    workletUrl?: string | URL;
    fetch?: typeof globalThis.fetch;
    extraOki?: {
        fetch?: typeof globalThis.fetch;
        wasmUrl?: string | URL;
        workletUrl?: string | URL;
    };
};
/** @typedef {Pick<import('./megasynth.js').MegaSynthOptions,'audioContext'|'outputNode'|'sampleOutputNode'|'masterVolume'|'mixer'> & {
 * chip?:'nes'|'snes'|'x68000'|'huc6280'|'segapsg', clock?:number, stereoEnabled?:boolean, fds?:boolean,
 * wasmUrl?:string|URL, workletUrl?:string|URL, fetch?:typeof globalThis.fetch,
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
    /** @type {{nes?:ReturnType<typeof createNesClient>,snes?:ReturnType<typeof createSnesClient>,opm?:ReturnType<typeof createYm2151Client>,adpcm?:ReturnType<typeof createOki6258Client>,pce?:ReturnType<typeof createHuc6280Client>,psg?:ReturnType<typeof createSegaPsgClient>}} */
    primaryApis: {
        nes?: ReturnType<typeof createNesClient>;
        snes?: ReturnType<typeof createSnesClient>;
        opm?: ReturnType<typeof createYm2151Client>;
        adpcm?: ReturnType<typeof createOki6258Client>;
        pce?: ReturnType<typeof createHuc6280Client>;
        psg?: ReturnType<typeof createSegaPsgClient>;
    };
    /** @type {ReturnType<typeof createNesClient>|null} */ nes: ReturnType<typeof createNesClient> | null;
    /** @type {ReturnType<typeof createSnesClient>|null} */ snes: ReturnType<typeof createSnesClient> | null;
    /** @type {ReturnType<typeof createYm2151Client>|null} */ opm: ReturnType<typeof createYm2151Client> | null;
    /** @type {ReturnType<typeof createOki6258Client>|null} */ adpcm: ReturnType<typeof createOki6258Client> | null;
    /** @type {ReturnType<typeof createHuc6280Client>|null} */ pce: ReturnType<typeof createHuc6280Client> | null;
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
    stopAllNative(): void;
    reset(): void;
    close(): Promise<void>;
}
