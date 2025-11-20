import { GraphNode } from "./types";

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

export function sortByLabel(a: GraphNode, b: GraphNode) {
  const aLabel = a.label;
  const bLabel = b.label;

  if (aLabel === bLabel) return 0;
  if (!aLabel) return -1;
  if (!bLabel) return 1;

  return aLabel.localeCompare(bLabel);
}
