/**
 * @file playground_sync.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された状態・UI コールバック。実際の UI 更新環境はコールバックに依存する。
 */
export declare function findPresetNameByReference(presets: any, presetOrder: any, preset: any): any;
export declare function handleMegaSynthEvent(event: any, options: any): void;
export declare function createFmProxy(targetSynth: any): {
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
    setFrequency(channel: any, block: any, fnum: any): void;
    keyOn(channel: any, operators: any): void;
    keyOff(channel: any, operators: any): void;
    writeDac(value: any): void;
    noteOn(channel: any, block: any, fnum: any): void;
    noteOff(channel: any): void;
    write(port: any, register: any, value: any): void;
    scheduleWrites(entries: any): void;
    clearScheduledWrites(): void;
    loadDacBank(name: any, bytes: any): void;
    playDacBank(name: any, time: any): void;
    clearDacPlayback(): void;
    writeAddress(port: any, register: any): void;
    writeData(value: any): void;
    read(offset: any): any;
    readStatus(): any;
    getIrq(): any;
    rawWrite(port: any, register: any, value: any): void;
    readonly transport: any;
};
