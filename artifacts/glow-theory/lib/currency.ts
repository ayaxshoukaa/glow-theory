export const USD_PER_KWD = 3.21;
export const USD_CURRENCY = "USD" as const;

export function kwdToUsdCents(amountKwd: number): number {
  return Math.round(amountKwd * 321);
}

export function kwdToUsd(amountKwd: number): number {
  return kwdToUsdCents(amountKwd) / 100;
}
