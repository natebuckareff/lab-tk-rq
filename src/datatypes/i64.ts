import { parseBigInt } from './bigint';
import type { Json } from './json';

export type I64 = bigint & { readonly I64: unique symbol };

export const i64 = (value: bigint): I64 => {
  return BigInt.asIntN(64, value) as I64;
};

export const MIN_I64 = i64(-9_223_372_036_854_775_808n);
export const MAX_I64 = i64(9_223_372_036_854_775_807n);

export const parseI64 = (value: Json): I64 => {
  const n = parseBigInt(value);
  assertI64(n);
  return n;
};

export function assertI64(value: bigint): asserts value is I64 {
  if (!isI64(value)) {
    throw new Error('value is not a valid i64');
  }
}

export const isI64 = (value: bigint): value is I64 => {
  return value >= MIN_I64 && value <= MAX_I64;
};
