import OBOGraphLoader from "../src/loaders/obograph";
import * as exampleGraph from "./data/basic.json";
import t from "tap";

t.test("load OBO graph", t => {
  const loader = new OBOGraphLoader();
  const graph = loader.fromString(JSON.stringify(exampleGraph));

  const expectedRoot = "http://purl.obolibrary.org/obo/UBERON_0002101";

  t.equal(graph.nodes.length, 4);
  t.equal(graph.roots.length, 1);
  t.equal(graph.roots[0]!.uri, expectedRoot);

  const hierarchy = graph.getHierarchy(expectedRoot);

  t.equal(hierarchy.items().length, 4);

  t.end();
});
