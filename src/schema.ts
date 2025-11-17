/** biome-ignore-all lint/suspicious/noExplicitAny: ignore */

export type Schema<Kind extends string, Type, Spec = never> = {
  readonly Type: Type;
  readonly kind: Kind;
  readonly spec: Spec;
};

export type AnySchema = Schema<any, any, any>;

export function createSchema<const Kind extends string, Type>(
  kind: Kind,
): Schema<Kind, Type>;

export function createSchema<const Kind extends string, Type, Spec>(
  kind: Kind,
  spec: Spec,
): Schema<Kind, Type, Spec>;

export function createSchema<const Kind extends string, Type>(
  kind: Kind,
  spec?: any,
): Schema<Kind, Type, any> {
  const schema = { kind } as Schema<Kind, Type, any>;

  if (spec !== undefined) {
    (schema as any).spec = spec;
  }

  return schema;
}
