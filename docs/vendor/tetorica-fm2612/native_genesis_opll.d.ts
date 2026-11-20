/** @param {any} context
 * @returns {Omit<ReturnType<typeof import('./native_genesis_voice_endpoint.js').createNativeVoiceEndpoint>,'client'> & {client:ReturnType<typeof import('./playground_ym2413.js').createYm2413Client>}}
 */
export declare function createNativeGenesisOpll(context: any): Omit<ReturnType<typeof import('./native_genesis_voice_endpoint.js').createNativeVoiceEndpoint>, 'client'> & {
    client: ReturnType<typeof import('./playground_ym2413.js').createYm2413Client>;
};
