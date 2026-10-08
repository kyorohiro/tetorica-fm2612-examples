export type WorkletSoundChip = {
    execution: 'worklet';
    name: import('./soundchip.js').WorkletChipName;
    port: MessagePort;
    node: AudioWorkletNode;
    audioContext: AudioContext;
    mixer: import('./soundchip_mixer.js').SoundChipMixer;
    readonly id: string;
    sampleRate(): number;
    request(method: string, args?: unknown[]): Promise<unknown>;
    createTransportPort(): MessagePort;
    start(): Promise<void>;
    stop(): Promise<void>;
    dispose(): Promise<void>;
};
/**
 * @param {import('./soundchip.js').WorkletChipName} name
 * @param {import('./soundchip.js').SoundChipOptions} options
 * @param {() => Promise<Uint8Array | ArrayBuffer | undefined>} loadBinary
 * @returns {Promise<WorkletSoundChip>}
 */
export declare function createWorkletSoundChip(name: import('./soundchip.js').WorkletChipName, options: import('./soundchip.js').SoundChipOptions, loadBinary: () => Promise<Uint8Array | ArrayBuffer | undefined>): Promise<WorkletSoundChip>;
