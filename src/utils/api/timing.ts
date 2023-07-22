import { OutgoingMessage } from "http";

export const calculateTime = <T>(
  name: string,
  res: OutgoingMessage,
  callback: () => T,
): T => {
  const start = performance.now();
  const result = callback();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
  res.appendHeader("Server-Timing", `${name};dur=${end - start}`);
  return result;
};
