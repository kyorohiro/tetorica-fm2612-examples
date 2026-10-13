/**
 * @file playground_audio_scheduler.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された時計・送信関数、setTimeout / clearTimeout。AudioContext 自体は作らない。
 */
/**
 * Queue events by absolute audio-clock time and send batches within a lookahead window.
 * The recipient must still schedule each event at its time; send() runs ahead of playback.
 * @template {{time: number}} Entry
 * @param {{now: () => number, send: (entries: Entry[]) => void,
 *   setTimer?: typeof globalThis.setTimeout, clearTimer?: typeof globalThis.clearTimeout}} options Clock in seconds, batch sender and timer hooks (milliseconds).
 * @returns {{getTiming: () => {lookaheadSeconds: number, schedulerIntervalMs: number},
 *   setTiming: (options?: {lookaheadSeconds?: number, schedulerIntervalMs?: number}) => {lookaheadSeconds: number, schedulerIntervalMs: number},
 *   enqueue: (entries: Entry[]) => void, clear: () => void}} Queue and timing controls.
 */
export declare function createAudioScheduler<Entry extends {
    time: number;
}>({ now, send, setTimer, clearTimer }: {
    now: () => number;
    send: (entries: Entry[]) => void;
    setTimer?: typeof globalThis.setTimeout;
    clearTimer?: typeof globalThis.clearTimeout;
}): {
    getTiming: () => {
        lookaheadSeconds: number;
        schedulerIntervalMs: number;
    };
    setTiming: (options?: {
        lookaheadSeconds?: number;
        schedulerIntervalMs?: number;
    }) => {
        lookaheadSeconds: number;
        schedulerIntervalMs: number;
    };
    enqueue: (entries: Entry[]) => void;
    clear: () => void;
};
