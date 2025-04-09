/**
 * get the length between two dates
 * @param startDate start date
 * @param endDate end date
 * @returns the length between two dates
 */
export function getBetweenDateLength(startDate: Date, endDate: Date) {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(diffDays - 1, 0);
}
