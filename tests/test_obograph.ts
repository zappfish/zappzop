import parseOBOGraph, { OBOGraph } from "../src/loaders/obograph";
import * as exampleGraph from "./data/basic.json";
import test from "tape";

test("load OBO graph", t => {
  t.expect(2);

  const graph = exampleGraph.graphs[0] as OBOGraph;
  const ontology = parseOBOGraph(graph);

  t.equal(ontology.items.length, 4);
  t.equal(ontology.root.uri, "http://purl.obolibrary.org/obo/UBERON_0002101");
});
