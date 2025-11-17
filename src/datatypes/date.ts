import type { Json } from './json';

const DATE_TIME_STRING_FORMAT_REGEX =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

export const parseDate = (value: Json): Date => {
  if (typeof value !== 'string') {
    throw new Error('invalid type');
  }
  if (!DATE_TIME_STRING_FORMAT_REGEX.test(value)) {
    throw new Error('invalid date');
  }
  return new Date(value);
};
