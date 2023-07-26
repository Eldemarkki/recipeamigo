type TimeEstimateType = null | "single" | "range";

export const getTimeEstimateType = (
  min: number,
  max: number | null,
): TimeEstimateType => {
  if (min === 0 && max === null) {
    return null;
  }
  if (max === null || min === max) {
    return "single";
  }
  return "range";
};
