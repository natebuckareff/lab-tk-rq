import { parseInteger } from './int';
import type { Json } from './json';

export type U32 = number & { readonly U32: unique symbol };

export const u32 = (value: number): U32 => {
  return (value >>> 0) as U32;
};

export const MAX_U32 = u32(4_294_967_295);

export const parseU32 = (value: Json): U32 => {
  const n = parseInteger(value);
  assertU32(n);
  return n;
};

export function assertU32(value: number): asserts value is U32 {
  if (!isU32(value)) {
    throw new Error('value is not a valid u32');
  }
}

export const isU32 = (value: number): value is U32 => {
  return value >= 0 && value <= MAX_U32;
};
