import { createRoot } from "react-dom/client";
// import Main from "./components/Main";
import HierarchyTree from "./components/Hierarchy";
import OBOGraphLoader from "./loaders/obograph/index";

// const el = document.getElementById("application")!;
// render(h(Main, null), el);
async function main() {
  const loader = new OBOGraphLoader();
  const graph = await loader.fromURI("zfa.json");
  const zpGraph = await loader.fromURI("zp-zapp.json");
  const zpRoot = zpGraph.getItem("http://purl.obolibrary.org/obo/ZP_0000000");
  const zfaPreferredRoot = "http://purl.obolibrary.org/obo/ZFA_0001439";
  const zpItems = zpGraph.findAllChildren(zpRoot);
  const zpByZFA: Map<string, typeof zpItems> = new Map();

  zpItems.forEach(node => {
    node.edges
      .filter(
        edge => edge.pred === "http://purl.obolibrary.org/obo/UPHENO_0000003",
      )
      .forEach(edge => {
        if (!zpByZFA.has(edge.obj)) {
          zpByZFA.set(edge.obj, []);
        }
        zpByZFA.get(edge.obj)!.push(node);
      });
  });

  const el = document.getElementById("application")!;
  const root = createRoot(el);
  const hierarchies = graph.getRootHierarchies();

  root.render(
    <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
    >
      <div>
        {[...hierarchies.values()].map(hierarchy => (
          <HierarchyTree
            key={hierarchy.root.uri}
            hierarchy={hierarchy}
            rootURI={hierarchy.root.uri}
            itemURI={hierarchy.root.uri}
            onSelectNode={node => {
              const nodes = zpByZFA.get(node.uri);
              if (!nodes) return;
              const el = document.getElementById("phenotypes");
              el!.innerHTML = nodes.map(n => n.label).join("<br />");
            }}
          />
        ))};
      </div>

      <div id="phenotypes">
      </div>
    </div>
  );
}

main();
