import { createSchema, type Schema } from '../schema';

const _string: Schema<'string', string> = createSchema('string');

export { _string as string };
