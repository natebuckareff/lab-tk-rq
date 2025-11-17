import type { Temporal } from 'temporal-polyfill';
import { createSchema, type Schema } from '../schema';

export type InstantSchema = Schema<'instant', Temporal.Instant>;

export const instant: InstantSchema = createSchema('instant');
