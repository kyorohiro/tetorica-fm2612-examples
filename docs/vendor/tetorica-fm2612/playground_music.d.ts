/**
 * @file playground_music.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された runtime・音源操作・待機関数。実際の再生環境は渡すオブジェクトに依存する。
 */
import { hzToBlockFnum } from "./pitch.js";
/** Create an evaluation's sequences, using persistent loop-local slots when active.
 * @param {() => {cycleState: Map<string, number>, cycleCallIndex: number} | null} [getCurrentLoopContext]
 */
export declare function createCycle(getCurrentLoopContext?: () => {
    cycleState: Map<string, number>;
    cycleCallIndex: number;
} | null): <T>(keyOrValues: string | T[], maybeValues?: T[]) => T;
/**
 * Linear interpolation; t is not clamped, so values outside 0..1 extrapolate.
 * @param {number} a Starting value.
 * @param {number} b Ending value.
 * @param {number} t Interpolation fraction.
 * @returns {number}
 */
export declare function lerp(a: number, b: number, t: number): number;
/**
 * Create note/pitch, scale, chord and loop-local sequence helpers.
 * @param {{noteToSemitone: Record<string, number>, scaleIntervals: Record<string, number[]>,
 *   createPitchFromMidi?: typeof import('./pitch.js').createPitchFromMidi,
 *   getPitch?: (midi:number) => {block:number,fnum:number},
 *   getFrequencyPitch?: (hz:number,clock?:number) => {block:number,fnum:number},
 *   getClockScale?: () => number,
 *   pitchReference?: {referenceMidi: number, referenceBlock: number, referenceFnum: number},
 *   synth: () => import('./ym2612synth.js').YM2612Synth | null,
 *   presets: Record<string, import('./ym2612synth.js').YM2612Preset>, activeNotes: Set<number>,
 *   sleep: (seconds: number) => Promise<void>, waitBeats?: (beats:number) => Promise<void>, getBpm?: () => number,
 *   getCurrentLoopContext?: () => {cycleState: Map<string, number>, cycleCallIndex: number} | null}} options Pitch reference, synth lookup, waits and sequence context.
 * @returns Music helpers; play waits for note duration and releases only the note it owns.
 */
export declare function createPlaygroundMusic(options: {
    noteToSemitone: Record<string, number>;
    scaleIntervals: Record<string, number[]>;
    createPitchFromMidi?: typeof import('./pitch.js').createPitchFromMidi;
    getPitch?: (midi: number) => {
        block: number;
        fnum: number;
    };
    getFrequencyPitch?: (hz: number, clock?: number) => {
        block: number;
        fnum: number;
    };
    getClockScale?: () => number;
    pitchReference?: {
        referenceMidi: number;
        referenceBlock: number;
        referenceFnum: number;
    };
    synth: () => import('./ym2612synth.js').YM2612Synth | null;
    presets: Record<string, import('./ym2612synth.js').YM2612Preset>;
    activeNotes: Set<number>;
    sleep: (seconds: number) => Promise<void>;
    waitBeats?: (beats: number) => Promise<void>;
    getBpm?: () => number;
    getCurrentLoopContext?: () => {
        cycleState: Map<string, number>;
        cycleCallIndex: number;
    } | null;
}): {
    parseNoteName: (noteName: string) => number;
    toPitch: (noteOrMidi: string | number) => {
        block: number;
        fnum: number;
    };
    noteToBlockFnum: (note: string | number) => {
        block: number;
        fnum: number;
    };
    noteLerp: (from: string, to: string, t: number) => {
        block: number;
        fnum: number;
    };
    play: (note: string | number, options?: {
        channel?: number;
        preset?: string;
        beats?: number;
        seconds?: number;
        duration?: number;
    }) => Promise<void>;
    hzToBlockFnum: typeof hzToBlockFnum;
    midiToNoteName: (midi: number) => string;
    scale: (root: string, name: string, octaves?: number) => string[];
    chord: (root: string, name: 'major' | 'minor' | 'major7' | 'minor7' | 'dominant7') => string[];
    lerp: typeof lerp;
    choose: <T>(values: T[]) => T;
    cycle: <T>(keyOrValues: string | T[], maybeValues?: T[]) => T;
    rand: () => number;
    rrange: (min: any, max: any) => number;
    randInt: (min: any, max: any) => number;
};
