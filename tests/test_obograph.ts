import parseOBOGraph from "../src/loaders/obograph";
import { OBOGraphsSchema } from "../src/loaders/obograph/schema";
import * as exampleGraph from "./data/basic.json";
import t from "tap";

t.test("load OBO graph", t => {
  const result = OBOGraphsSchema.safeParse(exampleGraph)

  if (!result.success) {
    console.log(result.error.issues)
    throw Error()
  }

  const graph = result.data.graphs[0]!;
  const ontology = parseOBOGraph(graph);

  t.equal(ontology.items.length, 4);
  t.equal(ontology.root.uri, "http://purl.obolibrary.org/obo/UBERON_0002101");

  t.end();
});
