import { test, expect, describe } from "vitest";
import Path from "../src/path";

describe("Path", () => {
  test("construct a path", () => {
    const p = new Path(["A", "B"]);

    expect(p.key).toEqual('["A","B"]');
    expect(p.equals(new Path(["A", "B"]))).toEqual(true);
    expect(p.depth()).toEqual(2);
    expect(p.parent()!.equals(new Path(["A"]))).toEqual(true);
    expect(p.child("C").equals(new Path(["A", "B", "C"]))).toEqual(true);

    expect(p.isAncestorOf(new Path(["A", "B", "C"]))).toEqual(true);
    expect(p.isAncestorOf(new Path(["A"]))).toEqual(false);
  });
});
