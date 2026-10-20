/**
 * The port is owned by this client and may be transferred directly to a logic
 * Worker. Tone uploads are acknowledged before resolving; subsequent commands
 * on this port cannot overtake an upload. This API uses integer MIDI notes.
 * @param {MessagePort} port
 * @param {{sampleRate?:number,internalSampleRate?:number,voices?:Array<{index:number,name:string}>,selectedVoice?:number,stateRevision?:number}} [initial]
 */
export declare function createDx7Client(port: MessagePort, initial?: {
    sampleRate?: number;
    internalSampleRate?: number;
    voices?: Array<{
        index: number;
        name: string;
    }>;
    selectedVoice?: number;
    stateRevision?: number;
}): {
    sampleRate: number;
    internalSampleRate: number;
    readonly voices: {
        index: number;
        name: string;
    }[];
    readonly selectedVoice: number;
    _getState(): {
        sampleRate: number;
        internalSampleRate: number;
        voices: {
            index: number;
            name: string;
        }[];
        selectedVoice: number;
        stateRevision: number;
    };
    _adoptState(state: any): false | undefined;
    _onStateChange(listener: any): () => boolean;
    _stopVoices(): Promise<any>;
    getState(): Promise<any>;
    loadSysex(input: any): Promise<any>;
    /** Replace the selected slot from INIT defaults; retain the other bank voices.
     * @param {import('./msfa_dx7/src/preset.js').DX7Preset} preset */
    setPreset(preset: import('./msfa_dx7/src/preset.js').DX7Preset): Promise<void>;
    /** Patch OP1..6. Level/frequency edits also affect this patch's sounding
     * notes and release tails. Other operator parameters affect future notes.
     * @param {1|2|3|4|5|6} operator
     * @param {import('./msfa_dx7/src/preset.js').DX7OperatorParams} params */
    setOperator(operator: 1 | 2 | 3 | 4 | 5 | 6, params: import('./msfa_dx7/src/preset.js').DX7OperatorParams): Promise<void>;
    /** Validate and apply the entire batch atomically.
     * @param {ReadonlyArray<readonly [1|2|3|4|5|6, import('./msfa_dx7/src/preset.js').DX7OperatorParams]>} entries */
    setOperators(entries: ReadonlyArray<readonly [1 | 2 | 3 | 4 | 5 | 6, import('./msfa_dx7/src/preset.js').DX7OperatorParams]>): Promise<void>;
    /** Feedback 0..7, applied to this patch's sounding and future notes.
     * @param {number} feedback */
    setFeedback(feedback: number): Promise<void>;
    /** A fresh complete object after preceding commands have been applied.
     * @returns {Promise<import('./msfa_dx7/src/preset.js').DX7PresetState>} */
    getPreset(): Promise<import('./msfa_dx7/src/preset.js').DX7PresetState>;
    /** @param {number} index */
    selectVoice(index: number): void;
    /** @param {number} note @param {number} [velocity] */
    noteOn(note: number, velocity?: number): void;
    /** @param {number} note */
    noteOff(note: number): void;
    allNotesOff(): void;
    panic(): void;
    dispose(): void;
};
