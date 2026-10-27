/** Native uses the shared ADPCM renderer inside the existing chip callback.
 * Only bounded encoded RAM uploads cross IPC; playback never requests UI samples.
 * @param {any} synth
 * @param {{signal?:AbortSignal}} [options]
 */
export declare function createNativeMsm5205(synth: any, { signal }?: {
    signal?: AbortSignal;
}): {
    prepare(pcm: any, name: any, { signal: operationSignal }?: {}): Promise<void>;
    /** @param {{type:string,[key:string]:any}} action @param {{at?:number}} [timing] */
    command(action: {
        type: string;
        [key: string]: any;
    }, { at }?: {
        at?: number;
    }): any;
    dispose(): void;
};
