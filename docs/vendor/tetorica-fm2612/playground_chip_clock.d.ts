/** Chip clocks are Hz, independent of output frames, VGM samples and BPM. */
export declare const CHIP_CLOCKS: Readonly<{
    ym2612: 7670454;
    ym2203: 4000000;
    ym2610: 8000000;
    ym2610b: 8000000;
    ym2608: 8000000;
    ym2151: 3579545;
    segapsg: 3579545;
    gameboy: 4194304;
    nes: 1789773;
    snes: 1024000;
    x68000: 4000000;
    huc6280: 3579545;
    wonderswan: 3072000;
    pokey: 1789790;
    okim6258: 8000000;
    ay8910: 1789773;
    msx: 1789773;
    'msx-audio': 1789773;
    ym2413: 3579545;
    ym3526: 3579545;
    ym3812: 3579545;
    y8950: 3579545;
    ymf262: 14318180;
    rf5c164: 12500000;
    pwm: 23011361;
}>;
/** @param {number} hz */
export declare function validateChipClock(hz: number): number;
/** Preserve core registers, RAM and phase while changing their rate of advancement.
 * Used by fixed-rate cores; never resamples the output scheduling timeline. */
export declare class ChipClockResampler {
    ratio: number;
    remainder: number;
    left: number;
    right: number;
    counts: Uint32Array<any> | undefined;
    constructor();
    /** @param {number} hz @param {number} baseHz */
    setClock(hz: number, baseHz: number): void;
    resetPhase(): void;
    render(chip: any, left: any, right: any): void;
}
/** Ordered, acknowledged clock controls for Main and Worker clients.
 * @template T
 * @param {T} client @param {MessagePort} port @param {number} initialClock
 * @param {{primary?:boolean, batch?:boolean, onApplied?:(hz:number)=>void}} [options]
 * @returns {T & {readonly clock:number, setClock(hz:number):Promise<void>, _requestControl(method:string,args?:any[],transfer?:Transferable[]):Promise<any>}}
 */
export declare function attachChipClock<T>(client: T, port: MessagePort, initialClock: number, { primary, batch, onApplied }?: {
    primary?: boolean;
    batch?: boolean;
    onApplied?: (hz: number) => void;
}): T & {
    readonly clock: number;
    setClock(hz: number): Promise<void>;
    _requestControl(method: string, args?: any[], transfer?: Transferable[]): Promise<any>;
};
