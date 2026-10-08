/** AudioWorklet-side direct performance port. Main port only attaches/detaches.
 * The callback executes existing chip commands; it never asks the UI for audio work.
 */
export declare function createChipPortReceiver(apply: any, now?: () => number): (data: any) => boolean;
