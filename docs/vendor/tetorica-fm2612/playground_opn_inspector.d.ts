/** Private admin endpoint for every physical OPN instance. Reads never write to
 * the chip. Manual leases filter the same register path as Main and Worker.
 * Rhythm and ADPCM keys trigger the selected sound at its configured rate.
 */
export declare class OpnKeyboardInspector {
    kind: "ym2203" | "ym2608" | "ym2610" | "ym2610b" | "ym2612";
    guard: {
        handle(command: any): boolean;
    };
    clock: () => number;
    sampleRate: number;
    fm: number[];
    held: Map<any, any>;
    sequence: number;
    registers: Uint8Array<ArrayBuffer>[];
    levels: Uint8Array<ArrayBuffer>;
    adpcmRepeat: number;
    direct: (register: any, value: any, port?: number) => void;
    /** @param {{writeRegister:(register:number,value:number,port?:number)=>unknown,reset:(...args:any[])=>unknown}} chip
     * @param {{kind:'ym2612'|'ym2203'|'ym2608'|'ym2610'|'ym2610b',
     * guard:ReturnType<typeof import('./playground_audition_guard.js').createOpnAuditionGuard>,
     * clock:()=>number,sampleRate:number}} options */
    constructor(chip: {
        writeRegister: (register: number, value: number, port?: number) => unknown;
        reset: (...args: any[]) => unknown;
    }, { kind, guard, clock, sampleRate }: {
        kind: 'ym2612' | 'ym2203' | 'ym2608' | 'ym2610' | 'ym2610b';
        guard: ReturnType<typeof import('./playground_audition_guard.js').createOpnAuditionGuard>;
        clock: () => number;
        sampleRate: number;
    });
    channel(value: any): {
        id: string;
        section: string;
        channel: number;
    };
    observe(register: any, value: any, port: any): void;
    filter(register: any, value: any, port: any): any;
    read(): {
        kind: "ym2203" | "ym2608" | "ym2610" | "ym2610b" | "ym2612";
        clock: number;
        sampleRate: number;
        keyboardChannels: import("./playground_keyboard_channels.js").PlaygroundKeyboardChannel[];
        held: any[];
    };
    invoke(method: any, args?: any[]): boolean;
    release(target: any): void;
    clear(): void;
}
