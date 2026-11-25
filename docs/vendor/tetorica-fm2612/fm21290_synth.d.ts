import { Fm21290 } from './fm21290.js';
import { ModulatedChip } from './fm21290_modulation.js';
export declare class Fm21290Synth {
    sampleRate: any;
    internalSampleRate: any;
    chip: Fm21290 | undefined;
    controller: ModulatedChip | undefined;
    instrument: {
        setPatch: (value: any) => void;
        keyOn: (ch: any, note: any, velocity: number | undefined, owner: any) => void;
        keyOff: (ch: any, owner: any) => void;
        noteOn: (note: any, velocity: number | undefined, owner: any) => number | undefined;
        noteOff: (note: any, owner: any) => void;
        releasePitch: (note: any) => void;
        setSustain: (down: any, owner: any) => void;
        stopOwner: (owner: any) => void;
        rawEvent: (value: any, owner: any) => void;
        allNotesOff: () => void;
    } | undefined;
    bank: Uint8Array<ArrayBuffer>[] | undefined;
    selectedVoice: any;
    constructor(sampleRate: any);
    reset(): void;
    loadSysex(bytes: any): void;
    get voices(): {
        index: number;
        name: string;
    }[];
    selectVoice(index: any): void;
    getPreset(): import("./msfa_dx7/src/preset.js").DX7PresetState;
    update(patch: any, base: any): void;
    setPreset(preset: any): void;
    setOperators(entries: any): void;
    setOperator(op: any, params: any): void;
    setFeedback(feedback: any): void;
    noteOn(note: any, velocity: any): void;
    noteOff(note: any): void;
    allNotesOff(): void;
    panic(): void;
    dispose(): void;
    writeRegister(address: any, value: any): void;
    renderInto(buffer: any): void;
}
