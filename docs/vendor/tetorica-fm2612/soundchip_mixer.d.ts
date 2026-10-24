export type ChipMixSettings = {
    volume: number;
    pan: number;
    muted: boolean;
    solo: boolean;
    effectiveMuted?: boolean;
};
export type ChipMixOptions = {
    volume?: number;
    pan?: number;
    muted?: boolean;
    solo?: boolean;
};
export type ChipMixMeter = {
    id: string;
    left: number;
    right: number;
};
/** Allocate synchronously, before asynchronous chip initialization can overlap.
 * @param {string} name @param {string} [requested] @param {(id:string)=>boolean} [occupied]
 */
export declare function allocateSoundChipId(name: string, requested?: string, occupied?: (id: string) => boolean): string;
/** @param {string} [name] @returns {{volume: number, pan: number, muted: boolean}} */
export declare function soundChipMixDefaults(name?: string): {
    volume: number;
    pan: number;
    muted: boolean;
};
/** @param {{volume?: number, pan?: number, muted?: boolean, solo?: boolean}} settings */
export declare function validateChipMix(settings: {
    volume?: number;
    pan?: number;
    muted?: boolean;
    solo?: boolean;
}): void;
/** Stereo balance: retain the original stereo image at center.
 * @param {{volume: number, pan: number, muted: boolean, effectiveMuted?: boolean}} settings @returns {number[]} */
export declare function chipMixGains({ volume, pan, muted, effectiveMuted }: {
    volume: number;
    pan: number;
    muted: boolean;
    effectiveMuted?: boolean;
}): number[];
export type SoundChipMixerOptions = {
    factoryDefaults?: {
        version: number;
        kinds: Array<{
            name: string;
            volume?: number;
            pan?: number;
        }>;
    };
    factoryEntries?: {
        version: number;
        entries: Array<{
            id: string;
            name: string;
            settings: {
                volume?: number;
                pan?: number;
            };
        }>;
    };
    factoryEngines?: {
        version: number;
        engines: Array<{
            name: string;
            engine: string;
            volume?: number;
            pan?: number;
        }>;
    };
};
/** Settings can be prepared before start(). Importing this module opens no audio device. */
/** @typedef {{factoryDefaults?:{version:number,kinds:Array<{name:string,volume?:number,pan?:number}>},
 * factoryEntries?:{version:number,entries:Array<{id:string,name:string,settings:{volume?:number,pan?:number}}>},
 * factoryEngines?:{version:number,engines:Array<{name:string,engine:string,volume?:number,pan?:number}>}}} SoundChipMixerOptions */
export declare class SoundChipMixer {
    entries: Map<any, any>;
    retained: Map<any, any>;
    reservedIds: Set<any>;
    transientIds: Set<any>;
    kindDefaults: Map<any, any>;
    deferredState: Map<any, any>;
    factoryDefaults: Map<any, any>;
    factoryEntries: Map<any, any>;
    factoryEngines: Map<any, any>;
    listeners: Set<any>;
    meterListeners: Set<any>;
    /** Application factory policy is optional and never part of authored exports.
     * @param {SoundChipMixerOptions} [options] */
    constructor({ factoryDefaults, factoryEntries, factoryEngines }?: SoundChipMixerOptions);
    /** @param {string} [name] @param {string} [id] @param {string} [engine] */
    defaults(name?: string, id?: string, engine?: string): any;
    settingsFor(entry: any): any;
    /** Effective common volume/pan, including factory fallbacks.
     * @param {string} name @param {string} [engine] */
    getKindDefault(name: string, engine?: string): {
        volume: any;
        pan: any;
    };
    /** Explicit common policy only; mute and solo belong to a project/session. */
    exportDefaults(): {
        version: number;
        kinds: any[];
    };
    /** Validate the whole common policy before replacing it. Does not access storage. */
    configureDefaults(value: any): {
        version: number;
        kinds: any[];
    };
    setKindDefault(name: any, settings: any): {
        version: number;
        kinds: any[];
    };
    /** Persist authored overrides for stable IDs, including disconnected sources. */
    exportState(): {
        version: number;
        entries: {
            id: any;
            name?: any;
            settings: any;
        }[];
    };
    /** Replace project policy without replacing connected entry objects or routes.
     * Optional kind defaults are validated with the project before one output update. */
    restoreState(value: any, defaults?: undefined): {
        version: number;
        entries: {
            id: any;
            name?: any;
            settings: any;
        }[];
    };
    /** @param {string} id @param {ChipMixOptions} settings @returns {ChipMixSettings} */
    set(id: string, settings: ChipMixOptions): ChipMixSettings;
    /** @param {string} id @returns {ChipMixSettings} */
    get(id: string): ChipMixSettings;
    /** @returns {Array<ChipMixSettings & {id: string, name: string, connected: boolean, effectiveMuted: boolean}>} */
    list(): Array<ChipMixSettings & {
        id: string;
        name: string;
        connected: boolean;
        effectiveMuted: boolean;
    }>;
    /** Clear authored overrides back to current common/factory defaults. */
    reset(id?: undefined): any;
    hasSolo(): boolean;
    applyAll(): void;
    /** Observe source lifetimes and settings. No audio processing is enabled.
     * Source registration and release identify lifecycle-only notifications so
     * persistence observers can distinguish them from authored settings changes.
     * @param {(entries: ReturnType<SoundChipMixer['list']>, change?: {sourceLifecycle: boolean}) => void} listener */
    subscribe(listener: (entries: ReturnType<SoundChipMixer['list']>, change?: {
        sourceLifecycle: boolean;
    }) => void): () => boolean;
    notify(change?: undefined): void;
    /** Opt into post-trim, pre-FX/master stereo peaks. The last unsubscribe stops measurement.
     * @param {(entries: ChipMixMeter[]) => void} listener */
    subscribeMeters(listener: (entries: ChipMixMeter[]) => void): () => void;
    /** Endpoint hook for low-frequency aggregated peaks, never PCM. @param {string} id @param {number} left @param {number} right */
    reportMeter(id: string, left: number, right: number): void;
    /** Reserve an ID until the initializing endpoint has registered or failed.
     * @param {string} name @param {string} [requested] */
    reserveId(name: string, requested?: string): {
        id: string;
        release: () => void;
    };
    releaseTransientId(id: any): boolean;
    checkId(id: any): void;
    /** Register an output. Release disconnects the endpoint and retains settings only.
     * @param {string} id @param {string} name @param {(settings: ChipMixSettings) => void} apply
     * @param {{setMetering: (enabled: boolean) => void}} [meter]
     * @param {{engine?:string}} [identity] Engine selects factory fallbacks, not an extra multiplier or a saved setting. */
    register(id: string, name: string, apply: (settings: ChipMixSettings) => void, meter?: {
        setMetering: (enabled: boolean) => void;
    }, { engine }?: {
        engine?: string;
    }): () => void;
    /** Connect one stereo AudioNode before FX/master. Release disconnects this route only.
     * @param {string} id @param {string} name @param {AudioNode} node @param {AudioNode} destination @param {BaseAudioContext} [context]
     * @param {{engine?:string}} [identity] */
    connect(id: string, name: string, node: AudioNode, destination: AudioNode, context?: BaseAudioContext, identity?: {
        engine?: string;
    }): () => void;
}
/** Synchronous per-source PCM trims. Advances muted sources and ramps over 5 ms. */
export declare class PCMChipMixer {
    strips: Map<any, any>;
    constructor();
    addSource(id: any, source: any, method?: string, rate?: number): void;
    set(id: any, settings: any): void;
    get(id: any): any;
    reset(): void;
    apply(strip: any, pcm: any, frames: any): void;
}
