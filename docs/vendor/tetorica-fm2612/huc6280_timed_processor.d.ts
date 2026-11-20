export declare const huc6280TimedCommandCost: (command: any) => 1 | 12;
/** HuC6280-specific resolution and RPC. Time/order/storage belong to Performance Queue.
 * No user functions cross this boundary; captures occur between complete batches.
 */
export declare function createHuc6280TimedProcessor({ performance: timeline, getState, getConfig, dispatch, nowFrame, sampleRate, leadFrames, validatePlan }: {
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
    apply(operation: any, port: any, frame: any, metadata: any): boolean;
    clear(): void;
};
