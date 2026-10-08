/**
 * @file playground_music.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された runtime・音源操作・待機関数。実際の再生環境は渡すオブジェクトに依存する。
 */
import { hzToBlockFnum } from "./pitch.js";
export declare function lerp(a: any, b: any, t: any): number;
export declare function createPlaygroundMusic(options: any): {
    parseNoteName: (noteName: any) => any;
    toPitch: (noteOrMidi: any) => any;
    noteToBlockFnum: (note: any) => {
        block: any;
        fnum: any;
    };
    noteLerp: (from: any, to: any, t: any) => any;
    play: (note: any, options?: {}) => Promise<void>;
    hzToBlockFnum: typeof hzToBlockFnum;
    midiToNoteName: (midi: any) => string;
    scale: (root: any, name: any, octaves?: number) => string[];
    chord: (root: any, name: any) => any;
    lerp: typeof lerp;
    choose: (values: any) => any;
    cycle: (keyOrValues: any, maybeValues: any) => any;
    rand: () => number;
    rrange: (min: any, max: any) => number;
    randInt: (min: any, max: any) => number;
};
