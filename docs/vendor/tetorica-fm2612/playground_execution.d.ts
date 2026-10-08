export type PlaygroundExecutionGuardOptions = {
    enabled?: boolean;
};
/**
 * @typedef {{
 *   enabled?: boolean,
 * }} PlaygroundExecutionGuardOptions
 */
export declare function installPlaygroundExecutionGuards(realm?: typeof globalThis, options?: {}): () => void;
export declare function executeWithPlaygroundGuards(callback: any, realm?: typeof globalThis, options?: {}): Promise<any>;
