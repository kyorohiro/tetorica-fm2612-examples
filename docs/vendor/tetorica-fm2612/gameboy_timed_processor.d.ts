export declare const gameboyTimedCommandCost: (command: any) => 1 | 17;
/** Actual Gate-affecting bytes, independent of high-level API spelling. */
export declare function gameboyGateEvents(register: any, value: any): {
    channel: any;
    on: boolean;
}[];
export declare function gameboyOperationOffChannel(operation: any): any;
/** GAMEBOY-specific resolution and RPC. Time/order/storage belong to Performance Queue.
 * No user functions cross this boundary; captures occur between complete batches.
 */
export declare function createGameboyTimedProcessor({ performance: timeline, getState, getConfig, dispatch, nowFrame, sampleRate, leadFrames, validatePlan, retainState }: {
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
