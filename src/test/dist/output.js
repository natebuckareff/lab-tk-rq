function createSchema(kind, spec) {
  const schema = { kind };
  if (spec !== void 0) {
    schema.spec = spec;
  }
  return schema;
}
function defineSchema(name, builder) {
  {
    const schema = createSchema(name, builder());
    return schema;
  }
}
const deserializeFast = (schema, input) => {
  switch (schema.kind) {
    case "bool":
      return input;
    case "number":
      return input;
    case "string":
      return input;
    case "option":
      return input === null ? void 0 : deserializeFast(schema.spec, input);
    case "array":
    case "tuple":
      return input.map(
        (item) => deserializeFast(schema.spec, item)
      );
    case "object":
      return deserializeObject(schema, input);
    default:
      throw new Error(`unsupported schema kind "${schema.kind}"`);
  }
};
const deserializeObject = (schema, input) => {
  let output2;
  for (const [key, value] of Object.entries(input)) {
    const valueSchema = schema.spec[key];
    const deserializedValue = deserializeFast(valueSchema, value);
    if (output2) {
      output2[key] = deserializedValue;
    } else if (value !== deserializedValue) {
      output2 ??= { ...input };
      output2[key] = deserializedValue;
    }
  }
  return output2 ?? input;
};
const serialize = (schema, input) => {
  switch (schema.kind) {
    case "bool":
    case "number":
    case "string":
      return input;
    case "option":
      return input === void 0 ? null : serialize(schema.spec, input);
    case "array":
    case "tuple":
      return input.map((item) => serialize(schema.spec, item));
    case "object":
      return serializeObject(schema, input);
    default:
      throw new Error(`unsupported schema kind "${schema.kind}"`);
  }
};
const serializeObject = (schema, input) => {
  let output2;
  for (const [key, value] of Object.entries(input)) {
    const valueSchema = schema.spec[key];
    const serializedValue = serialize(valueSchema, value);
    if (output2) {
      output2[key] = serializedValue;
    } else if (value !== serializedValue) {
      output2 ??= { ...input };
      output2[key] = serializedValue;
    }
  }
  return output2 ?? input;
};
const _number = createSchema("number");
const _object = (spec) => {
  return createSchema("object", spec);
};
const _string = createSchema("string");
const userSchema = defineSchema(
  "user",
  () => _object({
    id: _number,
    name: _string,
    email: _string,
    age: _number
  })
);
const output = serialize(userSchema, {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  age: 30
});
console.log(output);
console.log(deserializeFast(userSchema, {}));
