import { OBOGraph } from  "./schema";
import Ontology, { OntologyTerm } from "../../ontology";

const parentProperties: Record<string, string> = {
  is_a: "rdfs:subClassOf",
  "http://purl.obolibrary.org/obo/BFO_0000050": "BFO:0000050",
};

export default function parseGraph(graph: OBOGraph) {
  const terms: Map<string, OntologyTerm> = new Map();

  for (const node of graph.nodes) {
    if (node.type !== "CLASS") continue;

    terms.set(node.id, {
      uri: node.id,
      label: node.lbl || node.id,
      parents: {},
      children: {},
    });
  }

  for (const edge of graph.edges) {
    if (edge.pred in parentProperties) {
      const predID = parentProperties[edge.pred]!;
      const parents = terms.get(edge.sub)?.parents;
      if (!parents) continue;

      if (!Object.hasOwn(parents, predID)) {
        parents[predID] = [];
      }

      parents[predID]!.push(edge.obj);
    }
  }

  return new Ontology([...terms.values()]);
}
