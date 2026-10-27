/** One PC Engine CD ADPCM source. Offsets and lengths are nibble counts.
 * @param {{prepare:(bytes:Uint8Array,name:string,options?:{signal?:AbortSignal})=>Promise<unknown>,command:(action:any,timing?:{at?:number})=>Promise<any>,dispose:()=>void}} adapter
 * @param {{readFile?:(path:string)=>Promise<Uint8Array|ArrayBuffer>,signal?:AbortSignal,getMix?:()=>any}} [options]
 */
export declare function createMsm5205Player(adapter: {
    prepare: (bytes: Uint8Array, name: string, options?: {
        signal?: AbortSignal;
    }) => Promise<unknown>;
    command: (action: any, timing?: {
        at?: number;
    }) => Promise<any>;
    dispose: () => void;
}, { readFile, signal, getMix }?: {
    readFile?: (path: string) => Promise<Uint8Array | ArrayBuffer>;
    signal?: AbortSignal;
    getMix?: () => any;
}): {
    /** Encoded four-bit OKI ADPCM, high nibble first, not WAV bytes. */
    /** @param {ArrayBuffer|Uint8Array|string} source */
    loadMemory(source: ArrayBuffer | Uint8Array | string): Promise<any>;
    /** @param {any} source @param {{rate?:number,signal?:AbortSignal,decodeAudio?:(bytes:ArrayBuffer)=>Promise<any>}} [options] */
    loadSample(source: any, options?: {
        rate?: number;
        signal?: AbortSignal;
        decodeAudio?: (bytes: ArrayBuffer) => Promise<any>;
    }): Promise<any>;
    /** @param {{offset?:number,length?:number,loop?:boolean,rate?:number,at?:number}} [options] */
    play(options?: {
        offset?: number;
        length?: number;
        loop?: boolean;
        rate?: number;
        at?: number;
    }): Promise<any>;
    /** @param {{at?:number}} [options] */
    stop(options?: {
        at?: number;
    }): Promise<any>;
    /** @param {{at?:number}} [options] */
    reset(options?: {
        at?: number;
    }): Promise<any>;
    /** @param {number} register @param {number} value @param {{at?:number}} [timing] */
    writeRegister(register: number, value: number, timing?: {
        at?: number;
    }): Promise<any>;
    getState(): Promise<any>;
    dispose(): void;
};
