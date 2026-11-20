export declare const opllTimedCommandCost: (command: any) => 1 | 64;
/** OPLL-specific resolution and RPC. Time/order/storage belong to Performance Queue.
 * No user functions cross this boundary; captures occur between complete batches.
 */
export declare function createOpllTimedProcessor({ performance: timeline, getState, getConfig, dispatch, nowFrame, sampleRate, leadFrames, validatePlan, }: {
    dispatch: any;
    getConfig: any;
    getState: any;
    leadFrames?: number | undefined;
    nowFrame: any;
    performance: any;
    sampleRate: any;
    validatePlan: any;
}): {
    receive(data: any, port: any): boolean;
    apply(command: any, port: any, frame: any, metadata: any): boolean;
    observeWrite(register: any, value: any, previous: any, intentMask: any, metadata: any, port: any): void;
    forget(key: any): void;
    discard(command: any, metadata: any): void;
    clear(): void;
};
