import type { Temporal } from 'temporal-polyfill';
import { createSchema, type Schema } from '../schema';

export type DurationSchema = Schema<'duration', Temporal.Duration>;

export const duration: DurationSchema = createSchema('duration');
