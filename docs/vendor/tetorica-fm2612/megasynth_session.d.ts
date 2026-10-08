import { MegaSynthLooper } from './looper.js';
export type MegaSynthSessionOptions = import('./megasynth_offline.js').MegaSynthOfflineOptions & {
    looperMode?: 'events' | 'pcm';
    looperMaxAudioSeconds?: number;
};
/** @typedef {import('./megasynth_offline.js').MegaSynthOfflineOptions & {looperMode?: 'events'|'pcm', looperMaxAudioSeconds?: number}} MegaSynthSessionOptions */
/** @param {MegaSynthSessionOptions} [options] */
export declare function createMegaSynthSession(options?: MegaSynthSessionOptions): Promise<MegaSynthSession>;
declare class MegaSynthSession {
    #private;
    fm: any;
    fx: any;
    looper: MegaSynthLooper;
    recording: {
        start: () => any;
        stop: () => any;
        export: () => any;
        import: (data: any) => any;
        /** @param {unknown} [data] @param {{loop?: boolean, reset?: boolean, ignorePatch?: boolean, ignoreOperators?: boolean}} [options] */
        play: (data?: unknown, options?: {
            loop?: boolean;
            reset?: boolean;
            ignorePatch?: boolean;
            ignoreOperators?: boolean;
        }) => any;
        stopPlayback: () => void;
        getState: () => {
            recording: boolean;
            playing: boolean;
        };
    };
    constructor(engine: any, options: any);
    get sampleRate(): any;
    get currentFrame(): any;
    get currentTime(): any;
    get pendingTimers(): number;
    applyFX(command: any): void;
    callFM(method: any, args: any): any;
    callPWM(method: any, args?: any[]): any;
    callLooper(method: any, args?: any[]): Promise<any>;
    schedule(frame: any, command: any): void;
    clearSchedule(): void;
    stopEvents(): Promise<void>;
    stop(): Promise<void>;
    /** Async only to await looper transitions; time still advances exclusively by PCM frames. */
    render(frames: any): Promise<{
        left: Float32Array<any>;
        right: Float32Array<any>;
        sampleRate: any;
    }>;
    close(): any;
}
export {};
