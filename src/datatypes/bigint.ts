import { assertString, type Json } from './json';

export const INTEGER_REGEX = /^-?[0-9]+$/;

export const parseBigInt = (value: Json): bigint => {
  assertString(value);
  if (!INTEGER_REGEX.test(value)) {
    throw new Error('invalid bigint');
  }
  return BigInt(value);
};
