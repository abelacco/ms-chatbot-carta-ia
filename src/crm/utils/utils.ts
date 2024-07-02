export function isTimeDifferenceGreater(
  firstDate: Date,
  secondDate: Date,
  minutesTimeDiff: number,
): boolean {
  const firstDateMs = firstDate.getTime();
  const secondDateMs = secondDate.getTime();
  const differenceInMinutes = (secondDateMs - firstDateMs) / (1000 * 60);
  //console.log(differenceInMinutes);
  return minutesTimeDiff <= differenceInMinutes;
}
