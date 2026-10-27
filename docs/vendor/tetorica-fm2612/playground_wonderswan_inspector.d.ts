/** Applied register/RAM mirror. Reading never generates audio or writes a register. */
export declare class WonderSwanVoiceInspector {
    clock: () => number;
    sampleRate: number;
    dispatch: ((command: any, owner?: string, metadata?: any) => any) | undefined;
    beginAudition: (channel: number, owner: string) => void;
    endAudition: (channel: number, owner: string) => void;
    auditions: Map<any, any>;
    registers: Uint8Array<ArrayBuffer> | undefined;
    memory: Uint8Array<ArrayBuffer> | undefined;
    /** @param {{clock?:number|(()=>number),sampleRate?:number,dispatch?:(command:any,owner?:string,metadata?:any)=>any,beginAudition?:(channel:number,owner:string)=>void,endAudition?:(channel:number,owner:string)=>void}} [options] */
    constructor({ clock, sampleRate, dispatch, beginAudition, endAudition }?: {
        clock?: number | (() => number);
        sampleRate?: number;
        dispatch?: (command: any, owner?: string, metadata?: any) => any;
        beginAudition?: (channel: number, owner: string) => void;
        endAudition?: (channel: number, owner: string) => void;
    });
    resetAuditions(): void;
    reset(): void;
    observeWrite(address: any, value: any): void;
    observeMemory(address: any, value: any): void;
    effectiveClock(): number;
    stage(callback: any, owner: any, preserveOwner?: boolean): any;
    frequency(stage: any, ch: any, hz: any): number;
    period(stage: any, ch: any, period: any): void;
    waveform(stage: any, ch: any, values: any): void;
    invoke(method: any, args?: any[]): any;
    read(): {
        kind: string;
        clock: number;
        effectiveClock: number;
        sampleRate: number;
        activeSource: string;
        outputEnabled: boolean;
        sampleAddress: number;
        voiceMode: boolean;
        sweep: {
            enabled: boolean;
            step: number;
            time: number;
        };
        noise: {
            enabled: boolean;
            type: number;
        };
        pcmVolume: number;
        registers: number[];
        channels: {
            channel: number;
            type: string;
            active: boolean;
            enabled: boolean;
            frequency: number;
            frequencyRegister: number;
            period: number;
            pan: {
                left: number;
                right: number;
            };
            waveform: number[];
            waveformKnown: boolean;
            registers: number[];
        }[];
    };
}
