/**
 * @file playground_sync.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された状態・UI コールバック。実際の UI 更新環境はコールバックに依存する。
 */
/**
 * Find the first preset name whose value is the same object as the supplied preset.
 * @template T
 * @param {Record<string, T>} presets Named preset objects.
 * @param {string[]} presetOrder Search order.
 * @param {T} preset Object to match by identity.
 * @returns {string | null} First matching name, or null.
 */
export declare function findPresetNameByReference<T>(presets: Record<string, T>, presetOrder: string[], preset: T): string | null;
/**
 * Forward a synth change notification to the operator editor; ignore unknown events.
 * @param {{type: string, channel?: number, preset?: object, operator?: number, params?: object, algorithm?: number, feedback?: number, enabled?: boolean, frequency?: number, left?: boolean, right?: boolean, ams?: number, pms?: number} | null} event Synth notification.
 * @param {{operatorTab: {syncReset: () => void, syncPreset: (channel: number, name: string | null, preset: object) => void, syncOperator: (channel: number, operator: number, params: object) => void, syncAlgo: (channel: number, algorithm: number, feedback: number) => void, syncLfo: (enabled: boolean, frequency: number) => void, syncPan: (channel: number, left: boolean, right: boolean, ams: number, pms: number) => void}, presets: Record<string, object>, presetOrder: string[]}} options Editor callbacks and named presets.
 * @returns {void}
 */
export declare function handleMegaSynthEvent(event: {
    type: string;
    channel?: number;
    preset?: object;
    operator?: number;
    params?: object;
    algorithm?: number;
    feedback?: number;
    enabled?: boolean;
    frequency?: number;
    left?: boolean;
    right?: boolean;
    ams?: number;
    pms?: number;
} | null, options: {
    operatorTab: {
        syncReset: () => void;
        syncPreset: (channel: number, name: string | null, preset: object) => void;
        syncOperator: (channel: number, operator: number, params: object) => void;
        syncAlgo: (channel: number, algorithm: number, feedback: number) => void;
        syncLfo: (enabled: boolean, frequency: number) => void;
        syncPan: (channel: number, left: boolean, right: boolean, ams: number, pms: number) => void;
    };
    presets: Record<string, object>;
    presetOrder: string[];
}): void;
/**
 * Expose the Playground FM facade while forwarding calls to the current synth.
 * @param {import('./ym2612synth.js').YM2612Synth} targetSynth Synth to delegate to.
 * @returns Forwarding FM controls with access to the same DAC API.
 */
export declare function createFmProxy(targetSynth: import('./ym2612synth.js').YM2612Synth): {
    readonly dac: any;
    reset(): void;
    setPreset(channel: any, preset: any): void;
    setOperator(channel: any, operator: any, params: any): void;
    setOperators(channel: any, entries: any): void;
    setAlgo(channel: any, algorithm: any, feedback?: number): void;
    setPan(channel: any, left: any, right: any, ams: any, pms: any): void;
    setLfo(enabled: any, frequency: any): void;
    setChannel3SpecialMode(enabled: any): void;
    setChannel3SpecialFrequency(operator: any, block: any, fnum: any): void;
    setDacEnabled(enabled: any): void;
    setFrequency(channel: any, ...args: any[]): void;
    setNote(channel: any, note: any): void;
    setBlockFnum(channel: any, block: any, fnum: any): void;
    noteOnRaw(channel: any, block: any, fnum: any): void;
    keyOn(channel: any, operators: any): void;
    keyOff(channel: any, operators: any): void;
    writeDac(value: any): void;
    noteOn(channel: any, ...args: any[]): void;
    noteOff(channel: any): void;
    write(port: any, register: any, value: any): void;
    scheduleWrites(entries: any): void;
    clearScheduledWrites(): void;
    loadDacBank(name: any, bytes: any): void;
    playDacBank(name: any, time: any): void;
    clearDacPlayback(): void;
    writeAddress(port: any, register: any): void;
    writeData(value: any): void;
    read(offset: any): number;
    readStatus(): number;
    getIrq(): any;
    rawWrite(port: any, register: any, value: any): void;
    readonly transport: import("./ym2612synth.js").YM2612Transport;
};
