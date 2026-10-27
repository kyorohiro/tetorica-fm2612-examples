/** Native uses the same PCM16 renderer inside the existing chip callback.
 * Only bounded PCM16 uploads cross IPC; playback never requests UI samples.
 * @param {any} synth
 * @param {{signal?:AbortSignal}} [options]
 */
export declare function createNativeCdda(synth: any, { signal }?: {
    signal?: AbortSignal;
}): {
    prepare(pcm: any, track: any, { signal: operationSignal }?: {}): Promise<void>;
    /** @param {{type:string,[key:string]:any}} action @param {{at?:number}} [timing] */
    command(action: {
        type: string;
        [key: string]: any;
    }, { at }?: {
        at?: number;
    }): any;
    dispose(): void;
};
