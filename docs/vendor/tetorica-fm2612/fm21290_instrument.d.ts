export declare function nextAutoSlot(cursor: any, available: any): number;
export declare function createInstrument(write: any, onKeyOn?: () => void, onKeyOff?: () => void): {
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
};
