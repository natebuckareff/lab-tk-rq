import { defineSchema } from '../compiler/define';
import { deserializeFast } from '../runtime/deserialize-fast';
import { serialize } from '../runtime/serialize';
import * as tk from '../schemas';

const userSchema = defineSchema('user', () =>
  tk.object({
    id: tk.number,
    name: tk.string,
    email: tk.string,
    age: tk.number,
  }),
);

const output = serialize(userSchema, {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
});

console.log(output);
console.log(deserializeFast(userSchema, {}));
