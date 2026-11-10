export type RF5C164NoteChannel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
/** Validate a note name or integer MIDI 0..127, returning MIDI. No Hz input.
 * @param {string|number} note @returns {number} */
export declare function rf5c164MidiNote(note: string | number): number;
/** Transpose a declared raw reference speed. This does not infer sample pitch.
 * @param {string|number} note
 * @param {{rootNote?:string|number,baseStep:number}} options
 * @returns {number} Rounded hardware step, clamped to 1..65535. */
export declare function rf5c164NoteStep(note: string | number, { rootNote, baseStep }: {
    rootNote?: string | number;
    baseStep: number;
}): number;
/** Keep declared raw speeds separate from temporary musical transposition. */
export declare class RF5C164NoteTuning {
    rootNote: number;
    selected: number;
    /** @type {(number|null)[]} */
    referenceSteps: (number | null)[];
    actualSteps: Uint16Array<ArrayBuffer>;
    constructor();
    /** Change future note conversions only; null returns to C4.
     * @param {string|number|null} note @returns {number} */
    setRootNote(note: string | number | null): number;
    /** Observe a successful raw channel operation. Omitting step keeps its basis.
     * @param {number} channel @param {{step?:number}} options
     * @param {boolean} [reference=true] Whether this is an authored raw write. */
    observeChannel(channel: number, options: {
        step?: number;
    }, reference?: boolean): void;
    /** Track actual physical register values, including partial step byte writes.
     * @param {number} register @param {number} value
     * @param {boolean} [reference=true] Musical writes must pass false. */
    observeRegister(register: number, value: number, reference?: boolean): void;
    /** @param {RF5C164NoteChannel} channel @param {string|number} note @returns {number} */
    noteStep(channel: RF5C164NoteChannel, note: string | number): number;
    /** @param {number} channel @param {number} step */
    observeNoteStep(channel: number, step: number): void;
    /** Raw reset clears register/reference speeds while retaining software Root. */
    reset(): void;
    getState(): {
        rootNote: number;
        selected: number;
        referenceSteps: (number | null)[];
        actualSteps: number[];
    };
}
export type RF5C164AsyncNoteControls = {
    /**
     * Software Root; null means C4, not detected pitch.
     */
    setRootNote: (note: string | number | null) => number;
    /**
     * Set the transposed raw step without retriggering.
     */
    setNote: (channel: RF5C164NoteChannel, note: string | number) => Promise<number>;
    /**
     * Set pitch and retrigger the physical channel.
     */
    noteOn: (channel: RF5C164NoteChannel, note: string | number) => Promise<void>;
    /**
     * Hard hardware key off.
     */
    noteOff: (channel: RF5C164NoteChannel) => Promise<void>;
};
/** Add note controls to the same asynchronous raw facade without new RPCs.
 * Await successful raw step configuration before using a note helper. Clock
 * changes retain hardware semantics: the same raw reference step detunes too.
 * @template {{setChannel:(channel:number,options:{step?:number})=>unknown,setPitch:(channel:number,step:number)=>unknown,
 * keyOn:(channel:number)=>unknown,keyOff:(channel:number)=>unknown,writeRegister:(register:number,value:number)=>unknown,reset:()=>unknown}} T
 * @param {T} client @returns {T & RF5C164AsyncNoteControls}
 */
export declare function attachRf5c164NoteControls<T extends {
    setChannel: (channel: number, options: {
        step?: number;
    }) => unknown;
    setPitch: (channel: number, step: number) => unknown;
    keyOn: (channel: number) => unknown;
    keyOff: (channel: number) => unknown;
    writeRegister: (register: number, value: number) => unknown;
    reset: () => unknown;
}>(client: T): T & RF5C164AsyncNoteControls;
