import type { AnySchema } from '../schema';
import type { ChoiceSchema, ChoiceSpec } from '../schemas/choice';
import type { ObjectSchema, ObjectSpec } from '../schemas/object';
import type { TupleSchema } from '../schemas/tuple';

export function willAlwaysCopy(schema: AnySchema): boolean {
  switch (schema.kind) {
    case 'date':
    case 'bigint':
    case 'u64':
    case 'i64':
    case 'duration':
    case 'instant':
    case 'plainDateTime':
    case 'plainDate':
    case 'plainMonthDay':
    case 'plainTime':
    case 'plainYearMonth':
    case 'zonedDateTime':
      return true;

    case 'option':
      return false;

    case 'array':
      return willAlwaysCopy(schema.spec);

    case 'tuple': {
      const { spec } = schema as TupleSchema<AnySchema[]>;
      return spec.every(spec => willAlwaysCopy(spec));
    }

    case 'object': {
      const { spec } = schema as ObjectSchema<ObjectSpec>;
      return Object.values(spec).every(spec => willAlwaysCopy(spec));
    }

    case 'choice': {
      const { spec } = schema as ChoiceSchema<ChoiceSpec>;
      return Object.values(spec).every(
        spec => spec !== null && willAlwaysCopy(spec),
      );
    }

    default:
      return false;
  }
}

export function setCowProperty(
  input: Record<string, unknown>,
  output: { value: Record<string, unknown> | undefined },
  key: string,
  fn: (input: unknown) => unknown,
): void {
  const value = input[key];
  if (value === undefined) {
    throw Error(`missing property "${key}"`);
  }
  const result = fn(value);
  if (output.value) {
    output.value[key] = result;
  } else if (value !== result) {
    output.value = { ...input };
    output.value[key] = result;
  }
}

export function mapCow<T, U>(
  input: T[],
  callback: (item: T, index: number) => U,
): U[] {
  let output: U[] | undefined;
  for (let i = 0; i < input.length; ++i) {
    const item = input[i]!;
    const value = callback(item, i);
    if (output) {
      output[i] = value;
    } else if (item !== value) {
      output = [...input] as unknown[] as U[];
      output[i] = value;
    }
  }
  return output ?? (input as unknown[] as U[]);
}
