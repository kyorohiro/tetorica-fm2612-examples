/**
 * @file playground_live.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された runtime・音声操作・時計・UI コールバック。ブラウザー API を直接生成しない。
 */
/**
 * Manage liveLoop definitions, prepared resources and cleanup hooks across evaluations.
 * @param {object} options Runtime state and lifecycle callbacks.
 * @param {{livePrepared: Map<string, unknown>, liveLoops: Map<string, object>, liveCleanupHooks: Map<string, object>}} options.runtime Per-runtime lifecycle maps.
 * @param {{clearFXChain: () => object[]}} options.megaDrive Audio owner used to detach effects.
 * @param {Set<object>} options.preparedFxUnits Effect units retained across evaluations.
 * @param {() => number} options.currentBeat Current beat position.
 * @param {() => object | null} options.getCurrentLoopContext Current loop.
 * @param {(loop: object | null) => void} options.setCurrentLoopContext Restore a loop context.
 * @param {(loop: object) => void} [options.cancelWaits] Wake a stopped loop's waits.
 * @param {(loop: object) => Promise<void>} [options.finishTasks] Await loop-owned asynchronous tasks.
 * @param {(loop: object) => void} [options.releaseTasks] Release completed loop task state.
 * @param {(line: string) => void} options.logLine Error/log sink.
 * @param {(message: string) => void} options.setStatus Status sink.
 * @param {(callback: () => unknown) => unknown | Promise<unknown>} [options.executeCallback] Optional execution guard wrapper.
 * @returns Preparation, loop registration/commit, stop and cleanup operations.
 */
export declare function createPlaygroundLive(options: {
    runtime: {
        livePrepared: Map<string, unknown>;
        liveLoops: Map<string, object>;
        liveCleanupHooks: Map<string, object>;
    };
    megaDrive: {
        clearFXChain: () => object[];
    };
    preparedFxUnits: Set<object>;
    currentBeat: () => number;
    getCurrentLoopContext: () => object | null;
    setCurrentLoopContext: (loop: object | null) => void;
    cancelWaits?: (loop: object) => void;
    finishTasks?: (loop: object) => Promise<void>;
    releaseTasks?: (loop: object) => void;
    logLine: (line: string) => void;
    setStatus: (message: string) => void;
    executeCallback?: (callback: () => unknown) => unknown | Promise<unknown>;
}): {
    clearRunFxChain: ({ preservePrepared }?: {
        preservePrepared?: boolean | undefined;
    }) => void;
    clearPrepared: () => void;
    livePrepare: (name: any, fn: any, api: any) => Promise<any>;
    liveLoop: (name: any, fn: any, evaluationState: any) => void;
    liveCleanup: (names: any, fn: any, evaluationState: any) => void;
    stopLoop: (name: any) => void;
    stopAllLoops: () => void;
    commitLiveLoops: (loopDefinitions: any) => void;
    commitLiveCleanups: (cleanupDefinitions: any, cleanupScope: any) => void;
    flushLiveCleanups: (activeNames?: Set<any>) => void;
    getActiveLoopNames: () => any[];
};
