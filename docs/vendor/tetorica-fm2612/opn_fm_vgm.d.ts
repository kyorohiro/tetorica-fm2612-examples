export declare function isYm2608FmRegister(port: any, register: any): boolean;
export declare function isYm2610FmRegister(port: any, register: any): boolean;
export declare function isYm2203FmRegister(port: any, register: any): boolean;
export declare function createOpnFmWriteTranslator(sourceClock: any, writeRegister: any, isFmRegister: any): (register: any, value: any, port?: number) => void;
