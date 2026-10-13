/** AudioWorklet-side direct performance port. Main port only attaches/detaches.
 * The callback executes existing chip commands; it never asks the UI for audio work.
 * @param {(command: Record<string, unknown>, reply?: (message: unknown) => void) => void} apply Processor command dispatcher.
 * @param {() => number} [now] Current audio time in seconds; defaults to currentFrame/sampleRate in a Worklet.
 * @returns {(data: {type: string, port?: MessagePort}) => boolean} Attach/detach handler; true means the message was handled.
 */
export declare function createChipPortReceiver(apply: (command: Record<string, unknown>, reply?: (message: unknown) => void) => void, now?: () => number): (data: {
    type: string;
    port?: MessagePort;
}) => boolean;
