export declare const psgTimedCommandCost: (command: any) => 1 | 3;
/** PSG-specific resolution and RPC. Time/order/storage belong to Performance Queue.
 * No user functions cross this boundary; captures occur between complete batches.
 */
export declare function createPsgTimedProcessor({ performance: timeline, getState, getConfig, dispatch, nowFrame, sampleRate, leadFrames, validatePlan, retainLevels, }: {
    dispatch: any;
    getConfig: any;
    getState: any;
    leadFrames?: number | undefined;
    nowFrame: any;
    performance: any;
    retainLevels: any;
    sampleRate: any;
    validatePlan: any;
}): {
    receive(data: any, port: any): boolean;
    apply(command: any, port: any, frame: any, metadata: any): boolean;
    observeWrite(register: any, value: any, metadata: any, port: any): void;
    discard(command: any, metadata: any): void;
    releaseNotes: () => boolean;
    clear(): void;
};
