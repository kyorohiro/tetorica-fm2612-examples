/** Shared Main/Worker endpoint; all masks and register batches have one author.
 * @param {any} synth
 * @param {{decodeAudio?:(bytes:ArrayBuffer)=>Promise<any>, fetcher?:typeof globalThis.fetch}} [options]
 */
export declare function createNativeGenesisRf5c164(synth: any, { decodeAudio, fetcher }?: {
    decodeAudio?: (bytes: ArrayBuffer) => Promise<any>;
    fetcher?: typeof globalThis.fetch;
}): {
    client: {
        id: string;
        loadMemory(bytes: any, address?: number): any;
        /** @param {any} source @param {{address?:number,loopStart?:number,endGuardBytes?:number}} [options] */
        loadSample(source: any, { address, loopStart, endGuardBytes }?: {
            address?: number;
            loopStart?: number;
            endGuardBytes?: number;
        }): Promise<{
            start: number;
            loopStart: any;
            step: number;
        }>;
        setChannel: (channel: any, options: any) => any;
        setPitch: (channel: any, step: any) => any;
        keyOn: (channel: any) => any;
        keyOff: (channel: any) => any;
        writeRegister: (register: any, value: any) => any;
        reset: () => any;
        setClock(hz: any): Promise<void>;
        dispose(): void;
    };
    dispatch(message: any, timing?: {}): Promise<void>;
    read(): Promise<{
        memoryRevision: number;
        samples: any[];
        memoryRanges: any[];
        auditions: {
            channel: any;
            id: any;
        }[];
        clock: any;
        sampleRate: any;
        channels: any;
        enabled: any;
        mask: any;
        selected: any;
        frame: any;
        kind: string;
    }>;
    invoke(method: any, args?: any[]): Promise<boolean>;
    /** @param {any} source @param {{name?:string,address?:number,loopStart?:number}} [options] */
    loadSample(source: any, options?: {
        name?: string;
        address?: number;
        loopStart?: number;
    }): Promise<{
        name: string;
        frames: number | undefined;
        step: number | undefined;
        waveform: number[];
        endGuardBytes?: number | undefined;
        address: any;
        end: any;
        loopStart: any;
        valid: boolean;
        start: any;
    }>;
    stopped(): void;
    reset(): void;
};
