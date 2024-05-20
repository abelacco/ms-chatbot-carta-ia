export function splitArray(array, tamanoSubArray: number) {
  const subArrays = [];
  for (let i = 0; i < array.length; i += tamanoSubArray) {
    subArrays.push(array.slice(i, i + tamanoSubArray));
  }
  return subArrays;
}
