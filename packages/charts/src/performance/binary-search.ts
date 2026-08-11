export const bisectDate = <TDatum>(
  data: readonly TDatum[],
  target: Date,
  accessor: (datum: TDatum) => Date,
): number => {
  let low = 0;
  let high = data.length;
  const targetTime = target.getTime();

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const datum = data[middle];
    const time = datum ? accessor(datum).getTime() : Number.POSITIVE_INFINITY;

    if (time < targetTime) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return Math.min(low, Math.max(data.length - 1, 0));
};
