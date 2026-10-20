export type PlaygroundKeyboardChannel = {
    id: string;
    label: string;
};
/** Physical/manual voices exposed by the Playground Keyboard inspector path.
 * This table never creates a chip, initializes an instrument or changes audio.
 * @typedef {{id:string,label:string}} PlaygroundKeyboardChannel
 */
/** @param {string} kind
 * @param {{fds?:boolean,fdsEnabled?:boolean,model?:string,registers?:ArrayLike<number>,rhythmEnabled?:boolean}} [options]
 * @returns {PlaygroundKeyboardChannel[]} */
export declare function keyboardChannels(kind: string, { fds, fdsEnabled, model, registers, rhythmEnabled }?: {
    fds?: boolean;
    fdsEnabled?: boolean;
    model?: string;
    registers?: ArrayLike<number>;
    rhythmEnabled?: boolean;
}): PlaygroundKeyboardChannel[];
/** Playback constraints belong beside the selector, instead of inventing a
 * pitched voice for noise generators or streaming sample FIFOs.
 * @param {string} kind @param {string} [channel] */
export declare function keyboardChannelHint(kind: string, channel?: string): "PWM plays a timed sample stream and has no independent pitched Keyboard channel." | "Plays the selected six-operator voice with up to 16 allocated notes." | "Plays this channel’s current instrument. Configure its voice or load a sample before using Keyboard." | "This chip has no Keyboard voice adapter. Use keyboard.bind() to connect a custom instrument." | "Triggers the configured hardware drum; MIDI pitch does not retune its shared physical channel." | "Triggers the configured sample at its current playback rate; MIDI pitch does not retune this sample voice." | "Triggers the current noise settings; MIDI pitch does not retune the noise generator." | "Uses the channel’s current waveform or noise settings. Noise playback keeps its configured rate." | "Uses this channel’s loaded PCM and volume/pan. C4 plays its configured sample speed; other keys transpose the playback rate." | "Uses this channel’s tone/noise mixer and volume or shared envelope. Noise and envelope settings are shared by all three channels.";
