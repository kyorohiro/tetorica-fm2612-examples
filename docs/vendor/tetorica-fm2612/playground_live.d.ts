/**
 * @file playground_live.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された runtime・音声操作・時計・UI コールバック。ブラウザー API を直接生成しない。
 */
export declare function createPlaygroundLive(options: any): {
    clearRunFxChain: () => void;
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
