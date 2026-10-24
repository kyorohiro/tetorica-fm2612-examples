/** The selected core belongs to a physical additional YM2612 instance. */
export declare function validateYm2612Engine(engine?: string): "nuked" | "ymfm";
/** Validate before reserving a Mixer ID, allocating a core or posting Worker RPC. */
export declare function validateSoundChipOptions(name: any, options: any): void;
