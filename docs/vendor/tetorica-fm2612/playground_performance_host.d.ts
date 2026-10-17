export declare function createPerformanceHost({ getContext, onSuspended }: {
    getContext: any;
    onSuspended?: (() => void) | undefined;
}): {
    start(endpoints: any, lookaheadSeconds: any): Promise<any>;
    attach: (port: any) => Promise<any>;
    cancelOwner({ session, owner }: {
        owner: any;
        session: any;
    }): void;
    detach(port: any): void;
    stop: () => void;
    readonly clock: any;
};
