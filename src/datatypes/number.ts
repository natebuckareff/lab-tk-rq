import type { Json } from './json';

export const NUMBER_REGEX =
  /^(?:NaN|-?Infinity|-?(?:0|[1-9]\d*)(?:\.\d+)?|-?\d(?:\.\d+)?e[+-]?\d+)$/;

export const parseNumber = (value: Json): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value !== 'string') {
    throw new Error('invalid type');
  }
  if (!NUMBER_REGEX.test(value)) {
    throw new Error('invalid number');
  }
  return Number(value);
};
