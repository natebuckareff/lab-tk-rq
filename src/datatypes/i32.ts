import { parseInteger } from './int';
import type { Json } from './json';

export type I32 = number & { readonly I32: unique symbol };

export const i32 = (value: number): I32 => {
  return (value | 0) as I32;
};

export const MIN_I32 = i32(-2_147_483_648);
export const MAX_I32 = i32(2_147_483_647);

export const parseI32 = (value: Json): I32 => {
  const n = parseInteger(value);
  assertI32(n);
  return n;
};

export function assertI32(value: number): asserts value is I32 {
  if (!isI32(value)) {
    throw new Error('value is not a valid i32');
  }
}

export const isI32 = (value: number): value is I32 => {
  return value >= MIN_I32 && value <= MAX_I32;
};
