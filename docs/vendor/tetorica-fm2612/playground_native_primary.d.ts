/** Primary controls borrow devices owned by the runtime. */
export declare function borrowNativeApi(raw: any, id: any, changed?: () => void, before?: () => boolean): any;
export declare function createNativePrimaryClient(name: any, port: any, options?: {}): {
    _getState(): import("./snessynth.js").SnesState;
    _stopVoices(): Promise<any>;
    _adoptState(state: any): void;
    sampleRate: number;
    nativeSampleRate: number;
    loadBRR(input: ArrayBuffer | ArrayBufferView, options: import('./snessynth.js').SnesBRROptions): Promise<import('./snessynth.js').SnesSample>;
    prepareTimeline(trace: import('./spc.js').SpcTimeline): Promise<any>;
    playTimeline(): Promise<any>;
    stopTimeline(): Promise<any>;
    getTimelineState(): Promise<any>;
    setPreset(ch: number, preset: import('./snessynth.js').SnesPreset): void;
    setChannel(ch: number, params: import('./snessynth.js').SnesPreset): void;
    setPitch(ch: number, pitch: number): void;
    setFrequency(ch: number, hz: number): void;
    setNote(ch: number, note: string | number): void;
    keyOn(ch: number): void;
    keyOff(ch: number): void;
    noteOn(ch: number, note?: string | number): void;
    noteOff(ch: number): void;
    allNotesOff(): void;
    reset(): void;
    writeDsp(register: number, value: number): void;
    readDsp(register: number): Promise<number>;
    getState(): Promise<ReturnType<import("./snessynth.js").SnesSynth['getState']>>;
    getPreset(ch: number): Promise<import('./snessynth.js').SnesVoiceState>;
    snapshot(): Promise<ReturnType<import("./snessynth.js").SnesSynth['snapshot']>>;
    dispose(): void;
} | {
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
    setPreset(preset: import('./msfa_dx7/src/preset.js').DX7Preset): Promise<void>;
    setOperator(operator: 1 | 2 | 3 | 4 | 5 | 6, params: import('./msfa_dx7/src/preset.js').DX7OperatorParams): Promise<void>;
    setOperators(entries: ReadonlyArray<readonly [1 | 2 | 3 | 4 | 5 | 6, import('./msfa_dx7/src/preset.js').DX7OperatorParams]>): Promise<void>;
    setFeedback(feedback: number): Promise<void>;
    getPreset(): Promise<import('./msfa_dx7/src/preset.js').DX7PresetState>;
    selectVoice(index: number): void;
    noteOn(note: number, velocity?: number): void;
    noteOff(note: number): void;
    allNotesOff(): void;
    panic(): void;
    dispose(): void;
} | (import("./ay8910synth.js").AY8910Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
}) | (import("./nesapusynth.js").NesApuSynth & {
    _stopVoices: () => Promise<void>;
}) | (import("./opl_synth.js").OPLSynth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
}) | (import("./ym2413synth.js").YM2413Synth & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
}) | ({
    dispose(): void;
} & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[]): Promise<any>;
});
/** Each endpoint keeps a direct Worker -> Worklet performance port. */
export declare function createNativeWorkerApis(connections: any, performance: any, observe: any): {
    apis: {};
    raw: Map<any, any>;
    stop(): Promise<any[]>;
    adopt(name: any, state: any): void;
};
