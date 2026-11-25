export type NesOperationState = {
    clock: number;
    registers: number[];
    enabled: number;
    fdsActive: boolean;
    fdsGain: number;
    fdsMaster: number;
    sample: {
        address: number;
        length: number;
    } | null;
};
/** @typedef {{clock:number,registers:number[],enabled:number,fdsActive:boolean,fdsGain:number,fdsMaster:number,sample:{address:number,length:number}|null}} NesOperationState */
/** Hardware reset baseline, not Synth voice defaults. @returns {NesOperationState} */
export declare function createNesOperationResetState({ clock }?: {
    clock?: number | undefined;
}): NesOperationState;
/** Only register/config state is used; no phases, length counters or PCM RAM. @returns {NesOperationState} */
export declare function validateNesOperationState(state: any): NesOperationState;
