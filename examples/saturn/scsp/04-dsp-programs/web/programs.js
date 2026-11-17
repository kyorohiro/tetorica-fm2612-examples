// Instruction source for the pinned SCSP DSP; pure assembly is separate from execution.
const gainSource = `000: XSEL=1 YSEL=1 IRA=32 ZERO=1 COEF=0
001: EWT=1 EWA=0 ZERO=1`;
const iirSource = `000: TRA=1 XSEL=0 YSEL=1 ZERO=1 COEF=1
001: XSEL=1 YSEL=1 IRA=32 BSEL=1 COEF=2
002: TWT=1 TWA=0 EWT=1 EWA=0 ZERO=1`;
export {gainSource,iirSource};
