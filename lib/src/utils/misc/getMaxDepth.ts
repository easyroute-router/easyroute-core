export const getMaxDepth = (array: any[], depthKey = 'nestingDepth') =>
  Math.max(...array.map((e) => e[depthKey] as number));
