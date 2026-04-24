export type LateFeeType = "percent" | "flat";

export function computeLateFee(
  subtotal: number,
  type: LateFeeType,
  value: number,
) {
  const fee = type === "percent" ? (subtotal * value) / 100 : value;

  return Math.round(fee * 100) / 100;
}
