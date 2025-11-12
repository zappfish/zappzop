import { createRoot } from "react-dom/client";
import HierarchyTree from "./components/Hierarchy";
import OBOGraphLoader from "./loaders/obograph/index";

async function main() {
  const loader = new OBOGraphLoader();
  const graph = await loader.fromURI("data/pato-simple.json");

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
              node
            }}
          />
        ))}
      </div>

      <div id="phenotypes">
      </div>
    </div>
  );
}

main();
