/**
 * The port is owned by this client and may be transferred directly to a logic
 * Worker. Tone uploads are acknowledged before resolving; subsequent commands
 * on this port cannot overtake an upload. This API uses integer MIDI notes.
 * @param {MessagePort} port
 * @param {{sampleRate?:number,internalSampleRate?:number,voices?:Array<{index:number,name:string}>,selectedVoice?:number}} [initial]
 */
export declare function createDx7Client(port: MessagePort, initial?: {
    sampleRate?: number;
    internalSampleRate?: number;
    voices?: Array<{
        index: number;
        name: string;
    }>;
    selectedVoice?: number;
}): {
    sampleRate: number;
    internalSampleRate: number;
    readonly voices: {
        index: number;
        name: string;
    }[];
    readonly selectedVoice: number;
    getState(): Promise<any>;
    loadSysex(input: any): Promise<any>;
    selectVoice(index: any): void;
    noteOn(note: any, velocity?: number): void;
    noteOff(note: any): void;
    allNotesOff(): void;
    panic(): void;
    dispose(): void;
};
