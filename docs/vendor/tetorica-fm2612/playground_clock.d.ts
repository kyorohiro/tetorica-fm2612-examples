/**
 * @file playground_clock.js
 * 実行環境: Browser / Web Worker / Node.js（使用 API に条件あり）
 * 依存: performance、タイマー、利用可能なら MessageChannel。
 * createDeadlineScheduler は共用。createPlaygroundClock の既定タイマーは window を使うため、
 * Worker / Node.js では setTimer を注入する。音声時計と実行コンテキストも呼び出し側から渡す。
 */
/** One deadline timer, with a separate task per continuation so microtasks drain
 * before another loop's context is restored. No per-loop deadline timers. */
/** @param {{now: () => number, setTimer?: typeof globalThis.setTimeout, clearTimer?: typeof globalThis.clearTimeout, createTaskChannel?: () => MessageChannel | null}} options */
export declare function createDeadlineScheduler({ now, setTimer, clearTimer, createTaskChannel, }: {
    now: () => number;
    setTimer?: typeof globalThis.setTimeout;
    clearTimer?: typeof globalThis.clearTimeout;
    createTaskChannel?: () => MessageChannel | null;
}): {
    wait(at: any, resume: any, owner: any): void;
    cancel(owner: any): void;
};
export declare function createPlaygroundClock(options: any): {
    cancelWaits: (owner: any) => void;
    nowSeconds: () => any;
    ensureMusicClock: () => void;
    beatsToSeconds: (beats: any) => number;
    currentBeat: () => number;
    sleep: (seconds: any, runToken?: any) => Promise<void>;
    sleepSamples: (samples: any, sampleRate?: number, runToken?: any) => Promise<void>;
    waitForBeat: (targetBeat: any, runToken?: any, loopState?: any) => Promise<void>;
    beat: (beats?: number) => Promise<void>;
    nextBeat: () => Promise<void>;
    setBpm: (bpm: any) => void;
    tween: (seconds: any, fn: any, runToken?: any) => Promise<void>;
};
