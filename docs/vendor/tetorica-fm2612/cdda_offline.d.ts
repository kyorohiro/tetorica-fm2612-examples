export type CddaOfflineMix = {
    volume?: number;
    mute?: boolean;
    pan?: number;
};
export type CddaOfflineSource = {
    processFrames: (frames: number) => {
        left: Float32Array;
        right: Float32Array;
    };
    sampleRate?: number | (() => number);
    mix?: CddaOfflineMix;
};
export type CddaOfflineSourceDescriptor = CddaOfflineMix & {
    engine: CddaOfflineSource;
};
export type CddaOfflineAction = {
    type: 'play';
    sourceFrame?: number;
} | {
    type: 'pause' | 'resume' | 'stop' | 'state' | 'ready';
} | {
    type: 'seek';
    sourceFrame: number;
} | (CddaOfflineMix & {
    type: 'mix';
});
export type CddaOfflineCallback = (clock: {
    frame: number;
    sampleRate: number;
}) => void;
export type CddaOfflineOptions = {
    sampleRate?: number;
    wasmBinary?: ArrayBuffer | Uint8Array;
    wasmBytes?: ArrayBuffer | Uint8Array;
    wasmURL?: string | URL;
    readFile?: (path: string, options?: {
        signal?: AbortSignal;
    }) => Promise<ArrayBuffer | Uint8Array>;
    signal?: AbortSignal;
    sources?: Array<CddaOfflineSource | CddaOfflineSourceDescriptor>;
};
/** @typedef {{volume?:number,mute?:boolean,pan?:number}} CddaOfflineMix */
/** @typedef {{processFrames:(frames:number)=>{left:Float32Array,right:Float32Array},
 * sampleRate?:number|(()=>number),mix?:CddaOfflineMix}} CddaOfflineSource */
/** @typedef {CddaOfflineMix & {engine:CddaOfflineSource}} CddaOfflineSourceDescriptor */
/** @typedef {{type:'play',sourceFrame?:number}|{type:'pause'|'resume'|'stop'|'state'|'ready'}|
 * {type:'seek',sourceFrame:number}|(CddaOfflineMix & {type:'mix'})} CddaOfflineAction */
/** @typedef {(clock:{frame:number,sampleRate:number})=>void} CddaOfflineCallback */
/** @typedef {{sampleRate?:number,wasmBinary?:ArrayBuffer|Uint8Array,
 * wasmBytes?:ArrayBuffer|Uint8Array,wasmURL?:string|URL,
 * readFile?:(path:string,options?:{signal?:AbortSignal})=>Promise<ArrayBuffer|Uint8Array>,
 * signal?:AbortSignal,sources?:Array<CddaOfflineSource|CddaOfflineSourceDescriptor>}} CddaOfflineOptions */
/** Offline PCM source and sample-clock mixer. No AudioContext is opened.
 * `cdda` is the same track/player API as realtime playback. `sources` borrows
 * synchronous engines exposing processFrames(count), at this output rate;
 * CD-DA and every source advance by exactly the same frame counts.
 * Extra source mix controls belong under source.mix, or use explicit
 * {engine,volume,mute,pan} descriptors. Bare engine.volume is its existing
 * internal gain and is deliberately not applied a second time here.
 *
 * Adapter {at} timestamps are absolute output-clock seconds. schedule(frame,
 * actionOrCallback) uses absolute output frames. Future commands acknowledge
 * their queue position immediately, so they can be awaited before render().
 * Callbacks must be synchronous and can write PSG/ADPCM registers on this clock.
 *
 * render() returns the existing encodeWav()-compatible {left,right,sampleRate}.
 * Source engine objects remain owned by their caller. No normalization,
 * clipping, device-gain defaults, or effects are applied implicitly.
 * @param {CddaOfflineOptions} [options]
 */
export declare function createCddaOffline({ sampleRate, wasmBinary, wasmBytes, wasmURL, readFile, signal, sources }?: CddaOfflineOptions): Promise<{
    cdda: {
        load(input: any): Promise<readonly Readonly<{
            number: any;
            file: any;
            title: any;
            startFrame: any;
        }>[] | readonly Readonly<{
            number: number;
            title: string;
            startFrame: 0;
        }>[]>;
        play(number?: number, options?: {
            offset?: number;
            at?: number;
        }): Promise<any>;
        pause: (options?: {
            at?: number;
        }) => Promise<any>;
        resume: (options?: {
            at?: number;
        }) => Promise<any>;
        stop(options?: {
            at?: number;
        }): Promise<any>;
        seek(seconds: number, options?: {
            at?: number;
        }): Promise<any>;
        getState(): Promise<any>;
        list: () => any;
        dispose(): void;
    };
    adapter: {
        /** @param {Uint8Array} pcm @param {string} number @param {{signal?:AbortSignal}} [options] */
        prepare(pcm: Uint8Array, number: string, { signal: operationSignal }?: {
            signal?: AbortSignal;
        }): Promise<{
            state: string;
            frame: any;
            positionFrames: any;
            durationFrames: number;
            phase: any;
            frames: number;
            sampleRate: number;
            sourceRate: number;
            outputFrames: any;
            gain: any;
            muted: boolean;
            positionSeconds: number;
            durationSeconds: number;
            outputFrame: number;
            volume: any;
            mute: boolean;
            pan: number;
            track: any;
        }>;
        /** @param {CddaOfflineAction} action @param {{at?:number}} [timing] */
        command(action: CddaOfflineAction, { at }?: {
            at?: number;
        }): Promise<{
            state: string;
            frame: any;
            positionFrames: any;
            durationFrames: number;
            phase: any;
            frames: number;
            sampleRate: number;
            sourceRate: number;
            outputFrames: any;
            gain: any;
            muted: boolean;
            positionSeconds: number;
            durationSeconds: number;
            outputFrame: number;
            volume: any;
            mute: boolean;
            pan: number;
            track: any;
        } | {
            state: string;
            frame: any;
            positionFrames: any;
            durationFrames: number;
            phase: any;
            frames: number;
            sampleRate: number;
            sourceRate: number;
            outputFrames: any;
            gain: any;
            muted: boolean;
            positionSeconds: number;
            durationSeconds: number;
            outputFrame: number;
            volume: any;
            mute: boolean;
            pan: number;
            track: any;
            scheduled: boolean;
            scheduledFrame: number;
        }>;
        dispose: () => void;
    };
    readonly currentFrame: number;
    readonly currentTime: number;
    sampleRate: number;
    schedule: (atFrame: number, action: CddaOfflineAction | CddaOfflineCallback) => {
        state: string;
        frame: any;
        positionFrames: any;
        durationFrames: number;
        phase: any;
        frames: number;
        sampleRate: number;
        sourceRate: number;
        outputFrames: any;
        gain: any;
        muted: boolean;
        positionSeconds: number;
        durationSeconds: number;
        outputFrame: number;
        volume: any;
        mute: boolean;
        pan: number;
        track: any;
    } | {
        state: string;
        frame: any;
        positionFrames: any;
        durationFrames: number;
        phase: any;
        frames: number;
        sampleRate: number;
        sourceRate: number;
        outputFrames: any;
        gain: any;
        muted: boolean;
        positionSeconds: number;
        durationSeconds: number;
        outputFrame: number;
        volume: any;
        mute: boolean;
        pan: number;
        track: any;
        scheduled: boolean;
        scheduledFrame: number;
    };
    /** @param {CddaOfflineMix} values @param {{at?:number}} [timing] */
    mix: (values: CddaOfflineMix, timing?: {
        at?: number;
    }) => Promise<{
        state: string;
        frame: any;
        positionFrames: any;
        durationFrames: number;
        phase: any;
        frames: number;
        sampleRate: number;
        sourceRate: number;
        outputFrames: any;
        gain: any;
        muted: boolean;
        positionSeconds: number;
        durationSeconds: number;
        outputFrame: number;
        volume: any;
        mute: boolean;
        pan: number;
        track: any;
    } | {
        state: string;
        frame: any;
        positionFrames: any;
        durationFrames: number;
        phase: any;
        frames: number;
        sampleRate: number;
        sourceRate: number;
        outputFrames: any;
        gain: any;
        muted: boolean;
        positionSeconds: number;
        durationSeconds: number;
        outputFrame: number;
        volume: any;
        mute: boolean;
        pan: number;
        track: any;
        scheduled: boolean;
        scheduledFrame: number;
    }>;
    clearSchedule(): void;
    /** @param {number} frames */
    render(frames: number): {
        left: Float32Array<ArrayBuffer>;
        right: Float32Array<ArrayBuffer>;
        sampleRate: number;
    };
    dispose(): void;
}>;
