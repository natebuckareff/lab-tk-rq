import type { Temporal } from 'temporal-polyfill';
import { createSchema, type Schema } from '../schema';

export type ZonedDateTimeSchema = Schema<
  'zonedDateTime',
  Temporal.ZonedDateTime
>;

export const zonedDateTime: ZonedDateTimeSchema = createSchema('zonedDateTime');
