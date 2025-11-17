import type { Temporal } from 'temporal-polyfill';
import { createSchema, type Schema } from '../schema';

export type PlainDateTimeSchema = Schema<
  'plainDateTime',
  Temporal.PlainDateTime
>;

export const plainDateTime: PlainDateTimeSchema = createSchema('plainDateTime');
