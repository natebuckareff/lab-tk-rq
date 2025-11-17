import { type AnySchema, createSchema, type Schema } from '../schema';

export type OptionSchema<S extends AnySchema> = Schema<
  'option',
  S['Type'] | undefined,
  S
>;

export const option = <S extends AnySchema>(schema: S): OptionSchema<S> => {
  return createSchema('option', schema);
};
