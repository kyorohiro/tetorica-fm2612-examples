import { createNativeVoiceContext } from './native_genesis_voice_endpoint.js';
/** Preparation uploads apply immediately; musical writes keep their existing
 * performance clock. Every resolved upload has crossed an applied-state fence.
 * @template [Group=unknown]
 * @template [AuthorVersion=unknown]
 * @param {ReturnType<typeof createNativeVoiceContext>} context
 * @param {{send?:(message:Record<string,unknown>,timing?:{time?:number,performance?:number,owner?:number|string,checkCurrent?:()=>void})=>unknown,
 * getGroup?:()=>Group,withGroup?:(group:Group,callback:()=>unknown)=>unknown,
 * clearAuthor?:(version:AuthorVersion)=>void,getAuthorVersion?:()=>AuthorVersion,
 * decodeAudio?:import('./y8950_adpcm.js').Y8950AdpcmDecoder,
 * onMemoryApplied?:(state:Record<string,unknown>,preview:import('./y8950_adpcm.js').Y8950AdpcmPreview|null)=>void}} [options] */
export declare function createNativeY8950AdpcmTransport<Group = unknown, AuthorVersion = unknown>(context: ReturnType<typeof createNativeVoiceContext>, { send, getGroup, withGroup, clearAuthor, getAuthorVersion, decodeAudio, onMemoryApplied }?: {
    send?: (message: Record<string, unknown>, timing?: {
        time?: number;
        performance?: number;
        owner?: number | string;
        checkCurrent?: () => void;
    }) => unknown;
    getGroup?: () => Group;
    withGroup?: (group: Group, callback: () => unknown) => unknown;
    clearAuthor?: (version: AuthorVersion) => void;
    getAuthorVersion?: () => AuthorVersion;
    decodeAudio?: import('./y8950_adpcm.js').Y8950AdpcmDecoder;
    onMemoryApplied?: (state: Record<string, unknown>, preview: import('./y8950_adpcm.js').Y8950AdpcmPreview | null) => void;
}): {
    captureContext: () => {
        token: {
            session: any;
            generation: any;
            version: number;
        };
        group: Group;
        generation: number;
        version: any;
    };
    checkCurrent: (scope: any) => void;
    withContext: (scope: any, callback: any) => unknown;
    decodeAudio?: import("./y8950_adpcm.js").Y8950AdpcmDecoder | undefined;
    loadMemory: (bytes: any, address: any, scope: any, preview: any) => Promise<void>;
    clearMemory: (scope: any) => Promise<void>;
    request(method: any, args: any, timing: {} | undefined, scope: any): Promise<void>;
    cancelGroup: (group: any) => Map<any, any>;
    cancelOwner(performance: any, owner: any): void;
    cancelPerformance(performance: any): void;
    reset(): void;
};
/** Shared lifecycle for OPL/OPLL/AY register-authoring clients. The audio thread
 * owns hardware state; applied readback never rewrites an author's cache. */
export declare function createNativeExtraRegisterVoice(synth: any, { kind, label, clock: initialClock, registerCount, voiceCount, createClient, createInspector, logical, physical, voiceKey, validate, adoptInspector, track, cancelAuthor, editChannel, melodicChannels, rhythmBase, layoutRegister, layoutRegisters, readLayout, physicalMatches, patchAuthor, readFields, describeAuthorEdit }: {
    adoptInspector: any;
    cancelAuthor: any;
    clock: any;
    createClient: any;
    createInspector: any;
    describeAuthorEdit: any;
    editChannel: any;
    kind: any;
    label: any;
    layoutRegister?: number | undefined;
    layoutRegisters?: any[] | undefined;
    logical?: NumberConstructor | undefined;
    melodicChannels?: number | undefined;
    patchAuthor: any;
    physical?: NumberConstructor | undefined;
    physicalMatches: any;
    readFields: any;
    readLayout: any;
    registerCount: any;
    rhythmBase?: number | undefined;
    track: any;
    validate: any;
    voiceCount: any;
    voiceKey?: NumberConstructor | undefined;
}): {
    client: any;
    dispatch: (message: any, timing: {} | undefined, scope: any) => Promise<any>;
    read: (args?: {}) => Promise<any>;
    invoke: (method: any, args?: any[], options?: {}) => Promise<any>;
    loadSample?: ((source: any, options?: {}) => Promise<{
        start: number;
        end: number;
        frames: number;
        paddedFrames: number;
        deltaN: number;
        sampleRate: number;
        duration: number;
        name: string;
        source: string;
        preview: {
            start: number;
            end: number;
            frames: number;
            name: string;
            source: string;
            waveform: number[];
        } | null;
        clock: any;
    }>) | undefined;
    cancelOwner(performance: any, owner: any): void;
    cancelPerformance(performance: any): void;
    initialize(): Promise<void>;
    mix(volume?: number, pan?: number): Promise<void>;
    reset(): void;
};
