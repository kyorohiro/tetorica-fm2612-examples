/** @param {any} context
 * @param {{stereoEnabled?:boolean,acknowledgeClock?:boolean}} [options]
 * @returns {Omit<ReturnType<typeof import('./native_genesis_voice_endpoint.js').createNativeVoiceEndpoint>,'client'> & {client:ReturnType<typeof import('./playground_segapsg.js').createSegaPsgClient>}}
 */
export declare function createNativeGenesisSegaPsg(context: any, { stereoEnabled, acknowledgeClock }?: {
    stereoEnabled?: boolean;
    acknowledgeClock?: boolean;
}): Omit<ReturnType<typeof import('./native_genesis_voice_endpoint.js').createNativeVoiceEndpoint>, 'client'> & {
    client: ReturnType<typeof import('./playground_segapsg.js').createSegaPsgClient>;
};
