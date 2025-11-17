import type { Temporal } from 'temporal-polyfill';
import { createSchema, type Schema } from '../schema';

export type PlainTimeSchema = Schema<'plainTime', Temporal.PlainTime>;

export const plainTime: PlainTimeSchema = createSchema('plainTime');
