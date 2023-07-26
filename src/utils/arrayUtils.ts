export const removeDuplicateStrings = (arr: string[]): string[] => {
  return arr.filter((item, index) => arr.indexOf(item) === index);
};

export const notNull = <T>(val: T): val is Exclude<T, null | undefined> => {
  return val !== null && val !== undefined;
};
