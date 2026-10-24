/** The same descriptor API as Web Audio. JavaScript DSP runs in a separate
 * native worker; it never executes in the native device callback.
 * send must preserve ordering with the synth's command/Stop barriers.
 * @param {{send:(message:any)=>void, getBeatSeconds?:()=>number}} [options]
 */
export declare function createNativeGenesisFX({ send, getBeatSeconds }?: {
    send: (message: any) => void;
    getBeatSeconds?: () => number;
}): {
    liveFx(name: string, { process, context, resetState }?: {
        process: (input: Float32Array[], output: Float32Array[], state: Record<string, unknown>, context: Record<string, unknown>) => void;
        context?: Record<string, unknown>;
        resetState?: boolean;
    }): void;
    updateContext(name: any, context: any): void;
    removeLiveFx(name: any): void;
    branch: (...children: any[]) => {
        type: string;
        children: any[];
        owner: /*elided*/ any;
        dispose(): void;
    };
    parallel: (...children: any[]) => {
        type: string;
        children: any[];
        owner: /*elided*/ any;
        dispose(): void;
    };
    setChain(effects?: any[]): any[];
    clear({ dispose }?: {
        dispose?: boolean | undefined;
    }): any[];
    dispose(): void;
    getChain(): any[];
    syncTempo(): void;
};
