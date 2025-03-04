export function fromDisplayToBaseUnit(
  displayBalance: number,
  decimals: number
): number {
  return displayBalance * 10 ** decimals;
}