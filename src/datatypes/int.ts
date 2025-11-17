import { assertNumber, type Json } from './json';

export type Int = number & { readonly Integer: unique symbol };

export const parseInteger = (value: Json): Int => {
  assertNumber(value);
  return int(value);
};

export const int = (value: number): Int => {
  assertInt(value);
  return value;
};

export function assertInt(value: number): asserts value is Int {
  if (!isInt(value)) {
    throw new Error('value is not a safe integer');
  }
}

export const isInt = (value: number): value is Int => {
  return Number.isSafeInteger(value);
};
