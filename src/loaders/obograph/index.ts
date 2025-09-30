import { OBOGraph, OBOGraphsSchema } from  "./schema";
import Graph, { GraphNode } from "../../graph";
import GraphLoader from "../"

const parentProperties: Record<string, string> = {
  is_a: "rdfs:subClassOf",
  "http://purl.obolibrary.org/obo/BFO_0000050": "BFO:0000050",
};

type OBOGraphNode = GraphNode & {
  meta?: OBOGraph["meta"];
}

export default class OBOGraphLoader extends GraphLoader<OBOGraph, OBOGraphNode> {
  parseGraph(graph: OBOGraph) {
    const terms: Map<string, OBOGraphNode> = new Map();

    for (const node of graph.nodes) {
      if (node.type !== "CLASS") continue;

      const bpvs = node.meta?.basicPropertyValues || []
      const replaced = !!bpvs.some(({ pred }) => pred === "http://purl.obolibrary.org/obo/IAO_0100001")

      if (replaced) continue;

      terms.set(node.id, {
        uri: node.id,
        label: node.lbl || node.id,
        parents: {},
        children: {},
        meta: node.meta,
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

    return new Graph([...terms.values()]);
  }

  loadGraphFromString(str: string) {
    const result = OBOGraphsSchema.safeParse(JSON.parse(str))

    if (!result.success) {
      console.log(result.error.issues)
      throw Error()
    }

    const graph = result.data.graphs[0]!;

    return graph
  }
}
