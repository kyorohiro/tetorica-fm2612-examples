/** Primary controls borrow devices owned by the runtime. */
export declare function borrowNativeApi(raw: any, id: any, changed?: () => void, before?: () => boolean): any;
export declare function createNativePrimaryClient(name: any, port: any, options?: {}): {
    _getState(): import("./snessynth.js").SnesState;
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
} | (import("./nesapusynth.js").NesApuSynth & {
    _stopVoices: () => void;
}) | ({
    dispose(): void;
} & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
});
/** Each endpoint keeps a direct Worker -> Worklet performance port. */
export declare function createNativeWorkerApis(connections: any, performance: any, observe: any): {
    apis: {};
    raw: Map<any, any>;
    stop(): void;
    adopt(name: any, state: any): void;
};
