/** Immediate ordered commands, shared by main-thread and Worker runtimes.
 * @param {MessagePort} port
 * @param {{clock?:number,stereoEnabled?:boolean}} [options] */
export declare function createSegaPsgClient(port: MessagePort, { clock, stereoEnabled }?: {
    clock?: number;
    stereoEnabled?: boolean;
}): {
    dispose(): void;
} & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
};
