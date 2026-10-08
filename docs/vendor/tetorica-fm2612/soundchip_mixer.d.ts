export type ChipMixSettings = {
    volume: number;
    pan: number;
    muted: boolean;
};
export type ChipMixOptions = {
    volume?: number;
    pan?: number;
    muted?: boolean;
};
/** Allocate synchronously, before asynchronous chip initialization can overlap.
 * @param {string} name @param {string} [requested] @param {(id:string)=>boolean} [occupied]
 */
export declare function allocateSoundChipId(name: string, requested?: string, occupied?: (id: string) => boolean): string;
/** @param {string} [name] @returns {ChipMixSettings} */
export declare function soundChipMixDefaults(name?: string): ChipMixSettings;
/** @param {{volume?: number, pan?: number, muted?: boolean}} settings */
export declare function validateChipMix(settings: {
    volume?: number;
    pan?: number;
    muted?: boolean;
}): void;
/** Stereo balance: retain the original stereo image at center.
 * @param {ChipMixSettings} settings @returns {number[]} */
export declare function chipMixGains({ volume, pan, muted }: ChipMixSettings): number[];
/** Settings can be prepared before start(). Importing this module opens no audio device. */
export declare class SoundChipMixer {
    entries: Map<any, any>;
    reservedIds: Set<any>;
    constructor();
    /** @param {string} id @param {ChipMixOptions} settings @returns {ChipMixSettings} */
    set(id: string, settings: ChipMixOptions): ChipMixSettings;
    /** @param {string} id @returns {ChipMixSettings} */
    get(id: string): ChipMixSettings;
    /** @returns {Array<ChipMixSettings & {id: string, name: string, connected: boolean}>} */
    list(): Array<ChipMixSettings & {
        id: string;
        name: string;
        connected: boolean;
    }>;
    /** @param {string} [id] */
    reset(id?: string): ChipMixSettings | undefined;
    /** Reserve an ID until the initializing endpoint has registered or failed.
     * @param {string} name @param {string} [requested] */
    reserveId(name: string, requested?: string): {
        id: string;
        release: () => void;
    };
    checkId(id: any): void;
    /** Register an output. The returned release only unregisters this connection.
     * @param {string} id @param {string} name @param {(settings: ChipMixSettings) => void} apply */
    register(id: string, name: string, apply: (settings: ChipMixSettings) => void): () => void;
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
