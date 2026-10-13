/**
 * @file playground_noise.js
 * 実行環境: Browser / Node.js
 * 依存: 注入された音声オブジェクトの noise API。実際の再生にはその音声バックエンドが必要。
 */
/**
 * Playground compatibility entry point for the runtime-owned noise API.
 * @template {{create: (...args: unknown[]) => unknown, stopAll: () => void}} Noise
 * @param {{noise?: Noise, audio?: {createNoiseApi?: () => Noise}} | null} megaDrive Audio owner.
 * @returns Existing noise API, lazily created API, or a placeholder that rejects create until initialized.
 */
export declare function createPlaygroundNoiseApi<Noise extends {
    create: (...args: unknown[]) => unknown;
    stopAll: () => void;
}>(megaDrive: {
    noise?: Noise;
    audio?: {
        createNoiseApi?: () => Noise;
    };
} | null): Noise | {
    create(): never;
    stopAll(): void;
};
