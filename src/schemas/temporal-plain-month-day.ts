import type { Temporal } from 'temporal-polyfill';
import { createSchema, type Schema } from '../schema';

export type PlainMonthDaySchema = Schema<
  'plainMonthDay',
  Temporal.PlainMonthDay
>;

export const plainMonthDay: PlainMonthDaySchema = createSchema('plainMonthDay');
