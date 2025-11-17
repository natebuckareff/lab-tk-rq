import { Temporal } from 'temporal-polyfill';
import type { JsonObject } from '../datatypes/json';
import type { AnySchema } from '../schema';
import type {
  ArraySchema,
  ChoiceSchema,
  ChoiceSpec,
  TupleSchema,
} from '../schemas';
import type { ObjectSchema, ObjectSpec } from '../schemas/object';

export const deserializeFast = <S extends AnySchema>(
  schema: S,
  input: unknown,
): S['Type'] => {
  switch (schema.kind) {
    case 'bool':
    case 'string':
    case 'int':
    case 'u32':
    case 'i32':
    case 'json':
      return input;

    case 'number':
      return Number(input);

    case 'bigint':
    case 'u64':
    case 'i64':
      return BigInt(input as string);

    case 'date':
      return new Date(input as string);

    case 'duration':
      return Temporal.Duration.from(input as string);

    case 'instant':
      return Temporal.Instant.from(input as string);

    case 'plainDateTime':
      return Temporal.PlainDateTime.from(input as string);

    case 'plainDate':
      return Temporal.PlainDate.from(input as string);

    case 'plainMonthDay':
      return Temporal.PlainMonthDay.from(input as string);

    case 'zonedDateTime':
      return Temporal.ZonedDateTime.from(input as string);

    case 'option':
      return input === undefined
        ? undefined // XXX
        : deserializeFast(schema.spec, input);

    case 'array': {
      const { spec } = schema as ArraySchema<AnySchema>;
      return (input as unknown[]).map(item => deserializeFast(spec, item));
    }

    case 'tuple': {
      const { spec } = schema as TupleSchema<AnySchema[]>;
      return (input as unknown[]).map((item, i) =>
        deserializeFast(spec[i]!, item),
      );
    }

    case 'object':
      return deserializeObject(schema, input as JsonObject);

    case 'choice':
      return deserializeChoice(schema, input as JsonObject);

    default:
      throw new Error(`unsupported schema kind "${schema.kind}"`);
  }
};

const deserializeObject = <S extends ObjectSchema<ObjectSpec>>(
  schema: S,
  input: JsonObject,
): S['Type'] => {
  let output: Record<string, any> | undefined;
  for (const [key, valueSchema] of Object.entries(schema.spec)) {
    const value = input[key];
    const deserializedValue = deserializeFast(valueSchema, value);
    if (output) {
      output[key] = deserializedValue;
    } else if (value !== deserializedValue) {
      output ??= { ...input };
      output[key] = deserializedValue;
    }
  }
  return output ?? input;
};

const deserializeChoice = <S extends ChoiceSchema<ChoiceSpec>>(
  schema: S,
  input: JsonObject,
): S['Type'] => {
  const { kind, ...rest } = input;
  const variantSchema = schema.spec[kind as string];

  if (variantSchema === null) {
    return input as S['Type'];
  }

  if (variantSchema!.kind === 'object') {
    const value = deserializeObject(variantSchema!, rest);
    return value === rest ? (input as S['Type']) : { kind, ...value };
  }

  const inputValue = rest.value;
  const outputValue = deserializeFast(variantSchema!, inputValue);

  return inputValue === outputValue
    ? (input as S['Type'])
    : ({ kind, value: outputValue } as S['Type']);
};
