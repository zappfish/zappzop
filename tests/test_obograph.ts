import parseOBOGraph, { OBOGraph } from "../src/loaders/obograph";
import * as exampleGraph from "./data/basic.json";
import t from "tap";

t.test("load OBO graph", t => {
  const graph = exampleGraph.graphs[0] as OBOGraph;
  const ontology = parseOBOGraph(graph);

  t.equal(ontology.items.length, 4);
  t.equal(ontology.root.uri, "http://purl.obolibrary.org/obo/UBERON_0002101");

  t.end();
});
