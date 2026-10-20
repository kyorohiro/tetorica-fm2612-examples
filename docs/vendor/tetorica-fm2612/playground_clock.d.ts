export type PlaygroundClockLoop = {
    runToken: number;
    stopped: boolean;
    cursorBeat: number;
    sampleCursorSeconds?: number;
    interruptError?: Error;
};
export type PlaygroundClockState = {
    bpm: number;
    clockStartTime: number | null;
    sampleClockStartTime: number | null;
};
export type DeadlineSchedulerOptions = {
    now: () => number;
    setTimer?: typeof globalThis.setTimeout;
    clearTimer?: typeof globalThis.clearTimeout;
    createTaskChannel?: () => MessageChannel | null;
};
export type DeadlineEntry = {
    at: number;
    resume: () => void;
    owner: unknown;
    serial: number;
    cancelled?: boolean;
};
export type DeadlineScheduler = {
    wait: (at: number, resume: () => void, owner?: unknown) => DeadlineEntry;
    retime: (entry: DeadlineEntry, at: number) => void;
    cancel: (owner?: unknown | ((owner: unknown) => boolean)) => void;
};
export type PlaygroundClockOptions = {
    /**
     * Mutable tempo and clock origins (seconds).
     */
    runtime: PlaygroundClockState;
    /**
     * Audio clock; falls back to performance.now().
     */
    getAudioContext?: () => Pick<BaseAudioContext, 'currentTime'> | null | undefined;
    /**
     * Generation identifying the current Run.
     */
    getCurrentRunToken: () => number;
    /**
     * Current liveLoop state.
     */
    getCurrentLoopContext: () => PlaygroundClockLoop | null;
    /**
     * Restore the loop before resuming an await.
     */
    setCurrentLoopContext?: (loop: PlaygroundClockLoop | null) => void;
    /**
     * Required outside a browser window; delay is milliseconds.
     */
    setTimer?: typeof globalThis.setTimeout;
    /**
     * Cancels a handle returned by setTimer.
     */
    clearTimer?: typeof globalThis.clearTimeout;
    /**
     * Optional task dispatch hook.
     */
    createTaskChannel?: () => MessageChannel | null;
};
/**
 * @file playground_clock.js
 * 実行環境: Browser / Web Worker / Node.js（使用 API に条件あり）
 * 依存: performance、タイマー、利用可能なら MessageChannel。
 * createDeadlineScheduler は共用。createPlaygroundClock の既定タイマーは window を使うため、
 * Worker / Node.js では setTimer を注入する。音声時計と実行コンテキストも呼び出し側から渡す。
 */
/**
 * @typedef {{runToken: number, stopped: boolean, cursorBeat: number,
 *   sampleCursorSeconds?: number, interruptError?: Error}} PlaygroundClockLoop
 * @typedef {{bpm: number, clockStartTime: number | null,
 *   sampleClockStartTime: number | null}} PlaygroundClockState
 * @typedef {{now: () => number, setTimer?: typeof globalThis.setTimeout,
 *   clearTimer?: typeof globalThis.clearTimeout,
 *   createTaskChannel?: () => MessageChannel | null}} DeadlineSchedulerOptions
 * @typedef {{at:number, resume:()=>void, owner:unknown, serial:number, cancelled?:boolean}} DeadlineEntry
 * @typedef {{wait: (at: number, resume: () => void, owner?: unknown) => DeadlineEntry,
 *   retime: (entry:DeadlineEntry, at:number) => void,
 *   cancel: (owner?: unknown | ((owner: unknown) => boolean)) => void}} DeadlineScheduler
 * @typedef {Object} PlaygroundClockOptions
 * @property {PlaygroundClockState} runtime Mutable tempo and clock origins (seconds).
 * @property {() => Pick<BaseAudioContext, 'currentTime'> | null | undefined} [getAudioContext] Audio clock; falls back to performance.now().
 * @property {() => number} getCurrentRunToken Generation identifying the current Run.
 * @property {() => PlaygroundClockLoop | null} getCurrentLoopContext Current liveLoop state.
 * @property {(loop: PlaygroundClockLoop | null) => void} [setCurrentLoopContext] Restore the loop before resuming an await.
 * @property {typeof globalThis.setTimeout} [setTimer] Required outside a browser window; delay is milliseconds.
 * @property {typeof globalThis.clearTimeout} [clearTimer] Cancels a handle returned by setTimer.
 * @property {() => MessageChannel | null} [createTaskChannel] Optional task dispatch hook.
 */
/**
 * Share one deadline timer, dispatching each continuation in a separate task.
 * @param {DeadlineSchedulerOptions} options Clock in seconds and optional timer hooks.
 * @returns {DeadlineScheduler} Queue waits and wake cancelled owners; callers check cancellation themselves.
 */
export declare function createDeadlineScheduler({ now, setTimer, clearTimer, createTaskChannel, }: DeadlineSchedulerOptions): DeadlineScheduler;
/**
 * Create an elapsed-seconds timeline anchored once, avoiding accumulated timer
 * lateness between events. This resumes JavaScript; it does not reserve audio.
 * @param {{now:()=>number,sleep:(seconds:number)=>Promise<void>,check?:()=>void}} options
 * @returns {{waitUntil:(seconds:number)=>Promise<void>}}
 */
export declare function createSecondsTimeline({ now, sleep, check }: {
    now: () => number;
    sleep: (seconds: number) => Promise<void>;
    check?: () => void;
}): {
    waitUntil: (seconds: number) => Promise<void>;
};
/** Shared beat clock: BPM changes preserve phase and retime outstanding beat waits.
 * State belongs to one active runtime, not to individual liveLoops.
 * @param {{now:()=>number, scheduler:DeadlineScheduler, state:{bpm:number,clockStartTime:number|null}}} options
 */
export declare function createBeatClock({ now, scheduler, state }: {
    now: () => number;
    scheduler: DeadlineScheduler;
    state: {
        bpm: number;
        clockStartTime: number | null;
    };
}): {
    ensure: () => void;
    currentBeat: () => number;
    beatsToSeconds: (beats: any) => number;
    wait(targetBeat: any, resume: any, owner: any): void;
    setBpm(bpm: any): void;
};
/** Animate on the selected clock. Numeric duration is a legacy seconds shorthand.
 * Positive durations call 0 and then increasing progress, ending with 1 exactly once.
 * Zero duration calls only 1. Cancellation/error never forces a final callback.
 * @param {number | {seconds:number,beats?:never} | {beats:number,seconds?:never}} duration
 * @param {(progress:number)=>void|Promise<void>} onUpdate
 * @param {{seconds:()=>number,beats:()=>number,sleep:(seconds:number)=>Promise<void>,check:()=>void,getBpm:()=>number}} clock
 */
export declare function runTween(duration: number | {
    seconds: number;
    beats?: never;
} | {
    beats: number;
    seconds?: never;
}, onUpdate: (progress: number) => void | Promise<void>, clock: {
    seconds: () => number;
    beats: () => number;
    sleep: (seconds: number) => Promise<void>;
    check: () => void;
    getBpm: () => number;
}): Promise<void>;
/**
 * Create beat/sample waits and tempo helpers against the runtime's audio clock.
 * Waits reject when their Run or liveLoop stops. Timers resume JavaScript;
 * they do not schedule sample-accurate audio rendering.
 * @param {PlaygroundClockOptions} options Runtime state, loop context and clock hooks.
 * @returns {{cancelWaits: DeadlineScheduler['cancel'], nowSeconds: () => number,
 *   ensureMusicClock: () => void, beatsToSeconds: (beats: number) => number,
 *   currentBeat: () => number, currentSampleCursor: () => number,
 *   sleep: (seconds: number, runToken?: number) => Promise<void>,
 *   sleepSamples: (samples: number, sampleRate?: number, runToken?: number) => Promise<void>,
 *   waitForBeat: (targetBeat: number, runToken?: number, loopState?: PlaygroundClockLoop | null) => Promise<void>,
 *   beat: (beats?: number) => Promise<void>, nextBeat: () => Promise<void>,
 *   setBpm: (bpm: number) => void,
 *   tween: (duration: number | {seconds:number,beats?:never} | {beats:number,seconds?:never}, fn: (progress: number) => void | Promise<void>, runToken?: number) => Promise<void>}}
 */
export declare function createPlaygroundClock(options: PlaygroundClockOptions): {
    cancelWaits: DeadlineScheduler['cancel'];
    nowSeconds: () => number;
    ensureMusicClock: () => void;
    beatsToSeconds: (beats: number) => number;
    currentBeat: () => number;
    currentSampleCursor: () => number;
    sleep: (seconds: number, runToken?: number) => Promise<void>;
    sleepSamples: (samples: number, sampleRate?: number, runToken?: number) => Promise<void>;
    waitForBeat: (targetBeat: number, runToken?: number, loopState?: PlaygroundClockLoop | null) => Promise<void>;
    beat: (beats?: number) => Promise<void>;
    nextBeat: () => Promise<void>;
    setBpm: (bpm: number) => void;
    tween: (duration: number | {
        seconds: number;
        beats?: never;
    } | {
        beats: number;
        seconds?: never;
    }, fn: (progress: number) => void | Promise<void>, runToken?: number) => Promise<void>;
};
