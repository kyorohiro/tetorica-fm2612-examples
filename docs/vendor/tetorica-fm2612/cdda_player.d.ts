/** Track management shared by realtime Browser/Native and offline renderers.
 * Position arguments are seconds; adapters use integer 44,100 Hz source frames.
 * Reading/preparation completes before a play command enters the audio clock.
 * @param {{prepare:(pcm:Uint8Array,track:string)=>Promise<unknown>,command:(action:object,timing?:object)=>Promise<any>,dispose:()=>unknown}} adapter
 * @param {{readFile?:(path:string)=>Promise<ArrayBuffer|Uint8Array>,signal?:AbortSignal,getMix?:()=>{volume:number,pan:number,muted:boolean,effectiveMuted?:boolean}|undefined}} [options]
 */
export declare function createCddaPlayer(adapter: {
    prepare: (pcm: Uint8Array, track: string) => Promise<unknown>;
    command: (action: object, timing?: object) => Promise<any>;
    dispose: () => unknown;
}, { readFile, signal, getMix }?: {
    readFile?: (path: string) => Promise<ArrayBuffer | Uint8Array>;
    signal?: AbortSignal;
    getMix?: () => {
        volume: number;
        pan: number;
        muted: boolean;
        effectiveMuted?: boolean;
    } | undefined;
}): {
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
    /** @param {number} [number] @param {{offset?:number,at?:number}} [options] */
    play(number?: number, options?: {
        offset?: number;
        at?: number;
    }): Promise<any>;
    /** @param {{at?:number}} [options] */
    pause: (options?: {
        at?: number;
    }) => Promise<any>;
    /** @param {{at?:number}} [options] */
    resume: (options?: {
        at?: number;
    }) => Promise<any>;
    /** @param {{at?:number}} [options] */
    stop(options?: {
        at?: number;
    }): Promise<any>;
    /** @param {number} seconds @param {{at?:number}} [options] */
    seek(seconds: number, options?: {
        at?: number;
    }): Promise<any>;
    getState(): Promise<any>;
    list: () => any;
    dispose(): void;
};
