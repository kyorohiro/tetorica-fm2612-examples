/**
 * Browser AudioWorklet / Node. Named JavaScript effects applied after native FX,
 * in registration order. User code must be synchronous and bounded.
 */
export declare class LiveFX {
    rate: any;
    effects: Map<any, any>;
    hasProcessed: boolean;
    input: any;
    output: any;
    constructor(rate: any);
    command(d: any): void;
    clear(): void;
    process(channels: any, report: any, observe: any): void;
}
