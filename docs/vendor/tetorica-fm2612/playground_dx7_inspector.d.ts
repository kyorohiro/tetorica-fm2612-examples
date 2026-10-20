/** Applied DX7 patch and note-gate observations, independent of accepted future edits.
 * Reading copies bytes only; it never renders PCM, queries a live envelope or flushes reservations.
 */
export declare class Dx7VoiceInspector {
    sampleRate: number;
    internalSampleRate: number;
    getApplied: () => {
        selectedVoice: number;
        voices: Uint8Array[];
    };
    getLogical: () => {
        selectedVoice: number;
        voices: Uint8Array[];
        pendingCommands: number;
    };
    dispatch: (command: {
        method: string;
        args?: any[];
    }, owner?: string) => void;
    beginAudition: (midi: number, owner: string) => void;
    endAudition: (midi: number, owner: string) => void;
    notes: Map<any, any>;
    auditions: Map<any, any>;
    byMidi: Map<any, any>;
    /** @param {{sampleRate:number,internalSampleRate?:number,
     * getApplied:()=>{selectedVoice:number,voices:Uint8Array[]},
     * getLogical:()=>{selectedVoice:number,voices:Uint8Array[],pendingCommands:number},
     * dispatch:(command:{method:string,args?:any[]},owner?:string)=>void,
     * beginAudition:(midi:number,owner:string)=>void,endAudition:(midi:number,owner:string)=>void}} options */
    constructor({ sampleRate, internalSampleRate, getApplied, getLogical, dispatch, beginAudition, endAudition }: {
        sampleRate: number;
        internalSampleRate?: number;
        getApplied: () => {
            selectedVoice: number;
            voices: Uint8Array[];
        };
        getLogical: () => {
            selectedVoice: number;
            voices: Uint8Array[];
            pendingCommands: number;
        };
        dispatch: (command: {
            method: string;
            args?: any[];
        }, owner?: string) => void;
        beginAudition: (midi: number, owner: string) => void;
        endAudition: (midi: number, owner: string) => void;
    });
    resetAuditions(): void;
    observe(command: any): void;
    blocked(command: any): boolean;
    edit(command: any): {
        kind: string;
        sampleRate: number;
        internalSampleRate: number;
        polyphony: number;
        selectedVoice: number;
        voices: any;
        preset: import("./msfa_dx7/src/preset.js").DX7PresetState;
        activeSource: string;
        activeNotes: {
            midi: any;
            velocity: any;
            manual: boolean;
        }[];
        auditions: {
            channel: number;
            midi: any;
            id: any;
        }[];
        logical: {
            selectedVoice: number;
            voices: any;
            preset: import("./msfa_dx7/src/preset.js").DX7PresetState;
            pendingCommands: number;
        };
    };
    invoke(method: any, args?: any[]): any;
    read(): {
        kind: string;
        sampleRate: number;
        internalSampleRate: number;
        polyphony: number;
        selectedVoice: number;
        voices: any;
        preset: import("./msfa_dx7/src/preset.js").DX7PresetState;
        activeSource: string;
        activeNotes: {
            midi: any;
            velocity: any;
            manual: boolean;
        }[];
        auditions: {
            channel: number;
            midi: any;
            id: any;
        }[];
        logical: {
            selectedVoice: number;
            voices: any;
            preset: import("./msfa_dx7/src/preset.js").DX7PresetState;
            pendingCommands: number;
        };
    };
}
