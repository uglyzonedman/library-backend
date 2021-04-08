const mapper = data =>
  Object.fromEntries(
    (Array.isArray(data) ? data : Object.entries(data)).map(([key, value]) => [
      key.toLowerCase().replace(/([-_][a-z])/g, group => group.toUpperCase().replace(/[-_]/g, '')),
      value,
    ])
  );

export default mapper;
