import { createSchema, type Schema } from '../schema';

export type DateSchema = Schema<'date', Date>;

export const date: DateSchema = createSchema('date');
