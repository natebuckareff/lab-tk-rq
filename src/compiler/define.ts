import { type AnySchema, createSchema, type Schema } from '../schema';
import * as tk from '../schemas';
import { compileDefinedSchema } from './compile';

export function defineSchema<Name extends string, S extends AnySchema>(
  name: Name,
  builder: () => S,
): Schema<Name, S['Type'], S> {
  if (import.meta.env.PROD) {
    throw Error('todo');
  } else {
    const originalSchema = builder();
    const definedSchema = createSchema(name, originalSchema);
    const code = compileDefinedSchema(name, originalSchema, {
      cow: true,
    });

    // TODO: write to .typekind/{name}.ts
    console.log(code);

    return definedSchema;
  }
}

// ~

const userSchema = defineSchema('user', () =>
  tk.object({
    id: tk.number,
    username: tk.option(tk.string),
    createdAt: tk.instant,
    value: tk.u64,
    // test: tk.choice({
    //   foo: null,
    //   bar: tk.tuple(tk.number, tk.bool),
    //   // baz: tk.object({
    //   //   x: tk.number,
    //   //   y: tk.bool,
    //   // }),
    // }),
    // huge: tk.bigint,
    // values: tk.array(tk.number),
    // maybe: tk.array(tk.option(tk.string)),
    // createdAt: tk.date,
    // info: tk.object({
    //   name: tk.string,
    //   age: tk.option(tk.number),
    //   point: tk.tuple(tk.option(tk.number), tk.string),
    // }),
  }),
);
