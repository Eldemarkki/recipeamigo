export const removeDuplicateStrings = (arr: string[]): string[] => {
  return arr.filter((item, index) => arr.indexOf(item) === index);
};
