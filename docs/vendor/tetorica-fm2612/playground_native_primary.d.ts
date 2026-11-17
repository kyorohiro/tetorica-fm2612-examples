/** Primary controls borrow devices owned by the runtime. */
export declare function borrowNativeApi(raw: any, id: any, changed?: () => void, before?: () => boolean, settle?: (result: any) => any): any;
export declare function createNativePrimaryClient(name: any, port: any, options?: {}, lifecycle?: {}): any;
/** Each endpoint keeps a direct Worker -> Worklet performance port. */
export declare function createNativeWorkerApis(connections: any, performance: any, observe: any, lifecycle?: {}): {
    apis: {};
    raw: Map<any, any>;
    cancelAdpcmLoads(): void;
    stop(): Promise<any[]>;
    adopt(name: any, state: any, authorEdit: any): void;
};
