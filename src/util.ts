export function takeWhile<T>(
  arr: Array<T>,
  testFn: (item: T, i: number) => boolean,
) {
  const ret: Array<T> = [];

  let i = 0;

  for (const item of arr) {
    i += 1;

    if (!testFn(item, i)) {
      break;
    }

    ret.push(item);
  }

  return ret;
}
