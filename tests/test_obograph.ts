import { test, expect } from "vitest";
import OBOGraphLoader from "../src/loaders/obograph";
import * as exampleGraph from "./data/basic.json";

test("load OBO graph", () => {
  const loader = new OBOGraphLoader();
  const graph = loader.fromString(JSON.stringify(exampleGraph));

  const expectedRoot = "http://purl.obolibrary.org/obo/UBERON_0002101";

  expect(graph.nodes.length).toBe(4);
  expect(graph.roots.length).toBe(1);
  expect(graph.roots[0]!.uri).toBe(expectedRoot);

  const hierarchy = graph.getHierarchy(expectedRoot);

  expect(hierarchy.items().length).toBe(4);
});
