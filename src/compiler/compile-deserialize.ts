import type { AnySchema } from '../schema';
import type {
  ArraySchema,
  ObjectSchema,
  ObjectSpec,
  OptionSchema,
  TupleSchema,
} from '../schemas';
import { addDependency, type Code, resolveCode, type State } from './codegen';

export const compileDeserialize = (schema: AnySchema, state: State): Code => {
  const rec = (schema: AnySchema): Code => {
    return compileDeserialize(schema, state);
  };

  switch (schema.kind) {
    case 'bool':
      addDependency(state, 'datatypes/json', 'parseBoolean');
      return { kind: 'external', name: 'parseBoolean' };

    case 'string':
      addDependency(state, 'datatypes/json', 'parseString');
      return { kind: 'external', name: 'parseString' };

    case 'int':
      addDependency(state, 'datatypes/int', 'int');
      return { kind: 'external', name: 'parseInteger' };

    case 'u32':
      addDependency(state, 'datatypes/u32', 'parseU32');
      return { kind: 'external', name: 'parseU32' };

    case 'i32':
      addDependency(state, 'datatypes/i32', 'parseI32');
      return { kind: 'external', name: 'parseI32' };

    case 'json':
      return { kind: 'id' };

    case 'number':
      addDependency(state, 'datatypes/number', 'parseNumber');
      return { kind: 'external', name: 'parseNumber' };

    case 'bigint':
      addDependency(state, 'datatypes/bigint', 'parseBigInt');
      return { kind: 'external', name: 'parseBigInt' };

    case 'u64':
      addDependency(state, 'datatypes/u64', 'parseU64');
      return { kind: 'external', name: 'parseU64' };

    case 'i64':
      addDependency(state, 'datatypes/i64', 'parseI64');
      return { kind: 'external', name: 'parseI64' };

    case 'date':
      addDependency(state, 'datatypes/date', 'parseDate');
      return { kind: 'external', name: 'parseDate' };

    case 'duration':
      addDependency(state, 'datatypes/json', 'parseString');
      // TODO: external temporal
      return {
        kind: 'template',
        arg: 'input',
        body: 'Temporal.Duration.from(parseString($input))',
      };

    case 'instant':
      addDependency(state, 'datatypes/json', 'parseString');
      // TODO: external temporal
      return {
        kind: 'template',
        arg: 'input',
        body: 'Temporal.Instant.from(parseString($input))',
      };

    case 'plainDateTime':
      addDependency(state, 'datatypes/json', 'parseString');
      // TODO: external temporal
      return {
        kind: 'template',
        arg: 'input',
        body: 'Temporal.PlainDateTime.from(parseString($input))',
      };

    case 'plainDate':
      addDependency(state, 'datatypes/json', 'parseString');
      // TODO: external temporal
      return {
        kind: 'template',
        arg: 'input',
        body: 'Temporal.PlainDate.from(parseString($input))',
      };

    case 'plainMonthDay':
      addDependency(state, 'datatypes/json', 'parseString');
      // TODO: external temporal
      return {
        kind: 'template',
        arg: 'input',
        body: 'Temporal.PlainMonthDay.from(parseString($input))',
      };

    case 'zonedDateTime':
      addDependency(state, 'datatypes/json', 'parseString');
      // TODO: external temporal
      return {
        kind: 'template',
        arg: 'input',
        body: 'Temporal.ZonedDateTime.from(parseString($input))',
      };

    case 'option': {
      const s = schema as OptionSchema<AnySchema>;
      const spec = rec(s.spec);
      return {
        kind: 'template',
        arg: 'input',
        body: `$input === void 0 ? void 0 : ${resolveCode(spec, '$input')}`,
      };
    }

    case 'array': {
      addDependency(state, 'datatypes/json', 'parseArray');
      const s = schema as ArraySchema<AnySchema>;
      const spec = rec(s.spec);
      return {
        kind: 'template',
        arg: 'input',
        body: `parseArray($input).map(item => ${resolveCode(spec, 'item')})`,
      };
    }

    case 'tuple': {
      addDependency(state, 'datatypes/json', 'parseLength');
      const s = schema as TupleSchema<AnySchema[]>;
      const specs = s.spec.map(rec);
      const elements = specs.map((spec, i) =>
        resolveCode(spec, `$input[${i}]`),
      );
      return {
        kind: 'template',
        arg: 'input',
        body: `(parseLength($input, ${s.spec.length}), [${elements.join(', ')}])`,
      };
    }

    case 'object':
      return compileObject(schema, state);

    default:
      throw Error(`compilation not implemented for "${schema.kind}"`);
  }
};

const compileObject = (
  schema: ObjectSchema<ObjectSpec>,
  state: State,
): Code => {
  throw Error('todo');
};
