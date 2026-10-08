/**
 * @file playground_audio_scheduler.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された時計・送信関数、setTimeout / clearTimeout。AudioContext 自体は作らない。
 */
/**
 * Queue events by absolute audio-clock time and send batches within a lookahead window.
 * The recipient must still schedule each event at its time; send() runs ahead of playback.
 * @param {{now: () => number, send: (entries: any[]) => void, setTimer?: typeof setTimeout, clearTimer?: typeof clearTimeout}} options Clock, destination and optional timer hooks.
 * @param {function(): number} options.now Current audio-clock time in seconds.
 * @param {Function} options.send Receives a time-sorted array of due entries.
 * @param {Function} [options.setTimer=setTimeout] Schedule a callback after a delay in milliseconds.
 * @param {Function} [options.clearTimer=clearTimeout] Cancel the returned timer handle.
 * @returns {Object} getTiming/setTiming, enqueue and clear operations.
 */
export declare function createAudioScheduler({ now, send, setTimer, clearTimer }: {
    now: () => number;
    send: (entries: any[]) => void;
    setTimer?: typeof setTimeout;
    clearTimer?: typeof clearTimeout;
}): Object;
