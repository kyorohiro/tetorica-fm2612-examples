export declare const NATIVE_LIVEFX_COMMAND_BYTES: number;
/** The same public liveFx API, with explicit portable context and wire bounds. */
export declare function nativeGenesisLiveFxMessage(message: any): {
    op: string;
    action: any;
};
/** Low-frequency control diagnostics. Does not share the audio command queue,
 * reanchor its clock, transfer PCM or create an AudioContext/AudioNode.
 * @param {{invoke:(command:string,args?:object)=>Promise<any>, getSession:()=>number|null,
 * getGeneration:()=>number, isReady:()=>boolean, onChange?:(status:any)=>void,
 * onError?:(message:string)=>void, now?:()=>number, setTimer?:typeof setTimeout,
 * clearTimer?:typeof clearTimeout}} [options]
 */
export declare function createNativeGenesisLiveFxStatus({ invoke, getSession, getGeneration, isReady, onChange, onError, now, setTimer, clearTimer }?: {
    invoke: (command: string, args?: object) => Promise<any>;
    getSession: () => number | null;
    getGeneration: () => number;
    isReady: () => boolean;
    onChange?: (status: any) => void;
    onError?: (message: string) => void;
    now?: () => number;
    setTimer?: typeof setTimeout;
    clearTimer?: typeof clearTimeout;
}): {
    readonly status: Readonly<{
        active: 0;
        initialized: false;
        latencyFrames: 0;
        blockFrames: 128;
        underruns: 0;
        overruns: 0;
        queuedCommands: 0;
        error: null;
    }>;
    observe: (status: any, revision?: number) => void;
    track(): void;
    reset(): void;
    poll: () => Promise<void>;
};
