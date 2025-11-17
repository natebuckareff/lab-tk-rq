import type { Temporal } from 'temporal-polyfill';
import { createSchema, type Schema } from '../schema';

export type PlainDateSchema = Schema<'plainDate', Temporal.PlainDate>;

export const plainDate: PlainDateSchema = createSchema('plainDate');
