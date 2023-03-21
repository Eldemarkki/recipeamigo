export type ConvertDates<T> = {
  [k in keyof T]: (T[k] extends Date ? number : T[k]);
}
