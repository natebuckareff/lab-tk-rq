import { serializeString, foo, bar } from 'lib'
import { x } from 'util'

const serialize_0 = input => ({
  name: input.name,
  age: input.age,
});

const serialize_1 = input => ({
  id: input.id,
  username: input.username,
  values: input.values,
  point: [input.point[0] === void 0 ? null : input.point[0], input.point[1]],
  maybe: input.maybe.map(item => item === void 0 ? null : item),
  info: serialize_0(input.info),
});
