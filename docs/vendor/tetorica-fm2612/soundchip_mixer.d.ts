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
/** Settings can be prepared before start(). Importing this module opens no audio device. */
export declare class SoundChipMixer {
    entries: Map<any, any>;
    retained: Map<any, any>;
    reservedIds: Set<any>;
    transientIds: Set<any>;
    listeners: Set<any>;
    meterListeners: Set<any>;
    constructor();
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
    /** Reset settings explicitly, including settings retained for disconnected IDs. @param {string} [id] */
    reset(id?: string): ChipMixSettings | undefined;
    hasSolo(): boolean;
    applyAll(): void;
    /** Observe source lifetimes and settings. No audio processing is enabled.
     * @param {(entries: ReturnType<SoundChipMixer['list']>) => void} listener */
    subscribe(listener: (entries: ReturnType<SoundChipMixer['list']>) => void): () => boolean;
    notify(): void;
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
    checkId(id: any): void;
    /** Register an output. Release disconnects the endpoint and retains settings only.
     * @param {string} id @param {string} name @param {(settings: ChipMixSettings) => void} apply
     * @param {{setMetering: (enabled: boolean) => void}} [meter] */
    register(id: string, name: string, apply: (settings: ChipMixSettings) => void, meter?: {
        setMetering: (enabled: boolean) => void;
    }): () => void;
    /** Connect one stereo AudioNode before FX/master. Release disconnects this route only.
     * @param {string} id @param {string} name @param {AudioNode} node @param {AudioNode} destination @param {BaseAudioContext} [context] */
    connect(id: string, name: string, node: AudioNode, destination: AudioNode, context?: BaseAudioContext): () => void;
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
