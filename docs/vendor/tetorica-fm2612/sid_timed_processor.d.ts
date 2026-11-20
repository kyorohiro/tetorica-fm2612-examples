export declare const sidTimedCommandCost: (command: any) => 1 | 5;
/** Gate writes remain events even when the sent control byte is unchanged. */
export declare function sidGateEvents(register: any, value: any): {
    channel: number;
    on: boolean;
}[];
/** SID-specific resolution and RPC. Time/order/storage belong to Performance Queue.
 * No user functions cross this boundary; captures occur between complete batches.
 */
export declare function createSidTimedProcessor({ performance: timeline, getState, getConfig, dispatch, nowFrame, sampleRate, leadFrames, validatePlan, retainState }: {
    dispatch: any;
    getConfig: any;
    getState: any;
    leadFrames?: number | undefined;
    nowFrame: any;
    performance: any;
    retainState: any;
    sampleRate: any;
    validatePlan: any;
}): {
    receive(data: any, port: any): boolean;
    apply(command: any, port: any, frame: any, metadata: any): boolean;
    observeWrite(register: any, value: any, metadata: any, port: any): void;
    invoke: (payload: any, metadata: any, port: any) => any;
    releaseOwner: (owner: any) => boolean;
    releaseAll: () => boolean;
    discard(command: any, metadata: any): void;
    clear(): void;
};
