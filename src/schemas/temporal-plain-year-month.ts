import type { Temporal } from 'temporal-polyfill';
import { createSchema, type Schema } from '../schema';

export type PlainYearMonthSchema = Schema<
  'plainYearMonth',
  Temporal.PlainYearMonth
>;

export const plainYearMonth: PlainYearMonthSchema =
  createSchema('plainYearMonth');
