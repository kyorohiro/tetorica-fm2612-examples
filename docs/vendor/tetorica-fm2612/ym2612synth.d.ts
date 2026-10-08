import { YM2612DacPlayer } from "./ym2612_dac.js";
export type YM2612Transport = {
    write(port: number, register: number, value: number): void;
    reset?: () => void;
    read?: (offset: number) => number;
    readStatus?: () => number;
    getIrq?: () => boolean;
    dacCommand?: (command: object) => void | Promise<void>;
};
export type YM2612OperatorParams = {
    dt?: number;
    multi?: number;
    tl?: number;
    rs?: number;
    ar?: number;
    am?: boolean;
    d1r?: number;
    sr?: number;
    d2r?: number;
    sl?: number;
    rr?: number;
    ssg?: number;
};
export type YM2612PanParams = {
    left?: boolean;
    right?: boolean;
};
export type YM2612Preset = {
    algorithm?: number;
    feedback?: number;
    ams?: number;
    pms?: number;
    pan?: YM2612PanParams;
    operators?: [YM2612OperatorParams?, YM2612OperatorParams?, YM2612OperatorParams?, YM2612OperatorParams?];
};
export type YM2612SynthOptions = {
    transport: YM2612Transport;
};
/**
 * Direct transport for the current `web/ym2612.js` implementation.
 *
 * This keeps the synth layer from depending on `Ym2612` method names directly.
 * A future AudioWorklet transport can implement the same `write` / `reset` shape.
 */
export declare class YM2612DirectTransport {
    chip: {
        writeRegister(register: number, value: number, port?: number): void;
        sampleRate?: () => number;
        generateStereoView?: (frames: number) => {
            left: Float32Array;
            right: Float32Array;
        };
        generateStereo?: (frames: number) => {
            left: Float32Array;
            right: Float32Array;
        };
        reset?: () => void;
        read?: (offset: number) => number;
        readStatus?: () => number;
        getIrq?: () => boolean;
    };
    frame: number;
    dacPlayer: YM2612DacPlayer | null;
    dacPanRegister: number;
    /**
     * @param {{
     *   writeRegister(register: number, value: number, port?: number): void,
     *   sampleRate?: () => number,
     *   generateStereoView?: (frames: number) => {left: Float32Array, right: Float32Array},
     *   generateStereo?: (frames: number) => {left: Float32Array, right: Float32Array},
     *   reset?: () => void,
     *   read?: (offset: number) => number,
     *   readStatus?: () => number,
     *   getIrq?: () => boolean,
     * }} chip
     */
    constructor(chip: {
        writeRegister(register: number, value: number, port?: number): void;
        sampleRate?: () => number;
        generateStereoView?: (frames: number) => {
            left: Float32Array;
            right: Float32Array;
        };
        generateStereo?: (frames: number) => {
            left: Float32Array;
            right: Float32Array;
        };
        reset?: () => void;
        read?: (offset: number) => number;
        readStatus?: () => number;
        getIrq?: () => boolean;
    });
    reset(): void;
    write(port: any, register: any, value: any): void;
    dacCommand(command: any): void;
    /** Render through this transport to advance PCM playback and the Node timeline together. */
    generateStereo(frames: any): {
        left: Float32Array<any>;
        right: Float32Array<any>;
    };
    read(offset: any): number;
    readStatus(): number;
    getIrq(): boolean;
}
export declare class YM2612WorkletTransport {
    endpoint: AudioWorkletNode | MessagePort | import("./soundchip_worklet.js").WorkletSoundChip | null;
    node: AudioWorkletNode | MessagePort | import("./soundchip_worklet.js").WorkletSoundChip;
    irqAsserted: boolean;
    dacRequests: Map<any, any>;
    dacRequestId: number;
    disposed: boolean;
    /**
     * @param {AudioWorkletNode | MessagePort | import('./soundchip_worklet.js').WorkletSoundChip} node
     */
    constructor(node: AudioWorkletNode | MessagePort | import('./soundchip_worklet.js').WorkletSoundChip);
    start(): any;
    stop(): any;
    close(): Promise<void>;
    flush(): any;
    dacCommand(command: any): Promise<any>;
    /** Call before disconnecting/closing the node to reject unfinished registrations. */
    dispose(): void;
    reset(): void;
    write(port: any, register: any, value: any): void;
    scheduleWrites(entries: any): void;
    clearScheduledWrites(): void;
    loadDacBank(name: any, bytes: any): void;
    playDacBank(name: any, time: any): void;
    clearDacPlayback(): void;
    getIrq(): boolean;
}
export declare class YM2612Synth {
    transport: YM2612Transport;
    hooks: {
        onWrite: undefined;
        onRead: undefined;
        onIrq: undefined;
    };
    _lastIrqState: any;
    channels: any[];
    _pendingAddressPort: any;
    _pendingAddressRegister: any;
    _modeRegister: number | undefined;
    lfo: {
        enabled: false;
        frequency: 0;
    } | undefined;
    /**
     * @param {YM2612SynthOptions} options
     */
    constructor(options?: YM2612SynthOptions);
    reset(): void;
    /**
     * Apply a preset to one channel.
     *
     * Preset data should live outside this file.
     * This method only knows how to apply the preset shape.
     *
     * Supported shape:
     * {
     *   algorithm?: number,
     *   feedback?: number,
     *   pan?: { left?: boolean, right?: boolean },
     *   operators?: [op1, op2, op3, op4]
     * }
     *
     * @param {number} channel
     * @param {YM2612Preset} preset
     * @returns {void}
     */
    setPreset(channel: number, preset: YM2612Preset): void;
    /**
     * Partial operator update.
     *
     * Public operators use 0..3 so they match JavaScript indexing.
     *
     * @param {number} channel
     * @param {number} operator
     * @param {YM2612OperatorParams} params
     * @returns {void}
     */
    setOperator(channel: number, operator: number, params: YM2612OperatorParams): void;
    /**
     * Apply partial operator settings in array order, preserving repeated entries.
     * All inputs are validated before any state change or register write.
     * Fields within each entry use setOperator's register order.
     * @param {number} channel
     * @param {Array<[number, YM2612OperatorParams]>} entries
     * @returns {void}
     */
    setOperators(channel: number, entries: Array<[number, YM2612OperatorParams]>): void;
    /**
     * Set channel algorithm and feedback.
     *
     * @param {number} channel
     * @param {number} algorithm
     * @param {number} [feedback=0]
     * @returns {void}
     */
    setAlgo(channel: number, algorithm: number, feedback?: number): void;
    /**
     * Set left/right output enable, AM sensitivity, and PM sensitivity for one channel.
     *
     * @param {number} channel
     * @param {boolean} left
     * @param {boolean} right
     * @param {number} [ams]
     * @param {number} [pms]
     * @returns {void}
     */
    setPan(channel: number, left: boolean, right: boolean, ams?: number, pms?: number): void;
    /**
     * Set YM2612 chip-global LFO state.
     *
     * Register 0x22:
     * - bit 3 = LFO enable
     * - bits 2-0 = LFO frequency
     *
     * @param {boolean} enabled
     * @param {number} frequency
     * @returns {void}
     */
    setLfo(enabled: boolean, frequency: number): void;
    /**
     * Enable or disable YM2612 channel 3 special / 3-slot mode.
     *
     * Register 0x27:
     * - bit 6 = channel 3 special mode
     *
     * This method preserves the other mode/timer bits tracked by this synth
     * layer so it can coexist with future 0x27 helpers.
     *
     * @param {boolean} enabled
     * @returns {void}
     */
    setChannel3SpecialMode(enabled: boolean): void;
    /**
     * Set one channel 3 operator frequency while special mode is active.
     *
     * This is a thin YM2612-shaped helper:
     * - logical operators use 0..3
     * - block/fnum are written directly to YM2612 frequency registers
     *
     * Special channel 3 register mapping:
     * - OP3 -> 0xA8 / 0xAC
     * - OP1 -> 0xA9 / 0xAD
     * - OP2 -> 0xAA / 0xAE
     * - OP4 -> normal channel 3 0xA2 / 0xA6
     *
     * @param {number} operator
     * @param {number} block
     * @param {number} fnum
     * @returns {void}
     */
    setChannel3SpecialFrequency(operator: number, block: number, fnum: number): void;
    /**
     * Enable or disable the YM2612 DAC path on channel 6.
     *
     * Register 0x2B:
     * - bit 7 = DAC enable
     *
     * @param {boolean} enabled
     * @returns {void}
     */
    setDacEnabled(enabled: boolean): void;
    /**
     * Write one 8-bit DAC sample byte.
     *
     * Register 0x2A:
     * - one 8-bit DAC value
     *
     * The YM2612 DAC path is software-fed, so callers normally write many of
     * these in sequence at a chosen sample rate.
     *
     * @param {number} value
     * @returns {void}
     */
    writeDac(value: number): void;
    /**
     * Write BLOCK / F-NUM without triggering KEY ON.
     *
     * This is the explicit YM2612-shaped frequency helper:
     * - setFrequency(CH1, 4, 553)
     * - keyOn(CH1)
     *
     * @param {number} channel
     * @param {number} block
     * @param {number} fnum
     * @returns {void}
     */
    setFrequency(channel: number, block: number, fnum: number): void;
    /**
     * Trigger KEY ON on one channel.
     *
     * If operators are omitted, all four logical operators are keyed on.
     *
     * @param {number} channel
     * @param {number[]} [operators]
     * @returns {void}
     */
    keyOn(channel: number, operators?: number[]): void;
    /**
     * Trigger KEY OFF on one channel.
     *
     * YM2612 key off happens per channel through register 0x28.
     * If a partial operator list is passed, only those operator bits are cleared.
     *
     * @param {number} channel
     * @param {number[]} [operators]
     * @returns {void}
     */
    keyOff(channel: number, operators?: number[]): void;
    /**
     * Write BLOCK/FNUM and trigger Key On for all operators on one channel.
     *
     * @param {number} channel
     * @param {number} block
     * @param {number} fnum
     * @returns {void}
     */
    noteOn(channel: number, block: number, fnum: number): void;
    /**
     * Trigger Key Off for all operators on one channel.
     *
     * @param {number} channel
     * @returns {void}
     */
    noteOff(channel: number): void;
    /**
     * Write one YM2612 register.
     *
     * This is the compact form:
     *
     *   write(port, register, value)
     *
     * which corresponds to:
     *
     * - write register number to the address port
     * - write value to the data port
     *
     * This does not currently synchronize `this.channels` state.
     * It is mainly for low-level/manual YM2612 register work.
     *
     * @param {number} port
     * @param {number} register
     * @param {number} value
     * @returns {void}
     */
    write(port: number, register: number, value: number): void;
    scheduleWrites(entries: any): void;
    clearScheduledWrites(): void;
    loadDacBank(name: any, bytes: any): void;
    playDacBank(name: any, time: any): void;
    clearDacPlayback(): void;
    /**
     * Write one YM2612 register number to the address port.
     *
     * Port mapping:
     * - port 0 = A1=0, A0=0
     * - port 1 = A1=1, A0=0
     *
     * Use this together with `writeData()`.
     *
     * @param {number} port
     * @param {number} register
     * @returns {void}
     */
    writeAddress(port: number, register: number): void;
    /**
     * Write one YM2612 value to the data port after `writeAddress()`.
     *
     * Port mapping:
     * - port 0 = A1=0, A0=1
     * - port 1 = A1=1, A0=1
     *
     * @param {number} value
     * @returns {void}
     */
    writeData(value: number): void;
    /**
     * Read one raw YM2612 bus offset.
     *
     * Offset mapping:
     * - 0 = status port
     * - 1 = data port
     * - 2 = upper status port
     * - 3 = upper data port
     *
     * @param {number} offset
     * @returns {number}
     */
    read(offset: number): number;
    /**
     * Read the YM2612 status register.
     *
     * This is a convenience alias for low-level status reads.
     *
     * @returns {number}
     */
    readStatus(): number;
    /**
     * Attach low-level hooks for register traffic and IRQ changes.
     *
     * @param {{
     *   onWrite?: ((command: { port: number, register: number, value: number }) => void),
     *   onRead?: ((event: { offset: number, value: number }) => void),
     *   onIrq?: ((asserted: boolean) => void),
     * }} hooks
     * @returns {void}
     */
    setHooks(hooks?: {
        onWrite?: ((command: {
            port: number;
            register: number;
            value: number;
        }) => void);
        onRead?: ((event: {
            offset: number;
            value: number;
        }) => void);
        onIrq?: ((asserted: boolean) => void);
    }): void;
    /**
     * Backward-compatible alias for older playground/demo code.
     *
     * @param {number} port
     * @param {number} register
     * @param {number} value
     * @returns {void}
     */
    rawWrite(port: number, register: number, value: number): void;
    /**
     * Central write exit.
     *
     * This is intentionally one place so that later we can:
     * - swap the transport to AudioWorklet
     * - insert a recorder
     * - attach sample-timed command scheduling
     *
     * @param {number} port
     * @param {number} register
     * @param {number} value
     * @returns {void}
     */
    _write(port: number, register: number, value: number): void;
    getState(): any;
    _notifyRead(offset: any, value: any): void;
    _syncIrq(): void;
}
