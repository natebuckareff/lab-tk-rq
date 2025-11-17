import { parseBigInt } from './bigint';
import type { Json } from './json';

export type U64 = bigint & { readonly U64: unique symbol };

export const u64 = (value: bigint): U64 => {
  return BigInt.asUintN(64, value) as U64;
};

export const MAX_U64 = u64(18_446_744_073_709_551_615n);

export const parseU64 = (value: Json): U64 => {
  const n = parseBigInt(value);
  assertU64(n);
  return n;
};

export function assertU64(value: bigint): asserts value is U64 {
  if (!isU64(value)) {
    throw new Error('value is not a valid u64');
  }
}

export const isU64 = (value: bigint): value is U64 => {
  return value >= 0n && value <= MAX_U64;
};
