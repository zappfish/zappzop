import { useRef } from "react";
import { createRoot } from "react-dom/client";
import HierarchyTree, { HierarchyTreeHandle } from "./components/Hierarchy";
import TermSearch from "./components/Search";
import OBOGraphLoader, { OBOGraphNode } from "./loaders/obograph/index";
import Hierarchy from "./hierarchy";

type RenderedHierarchyProps = {
  hierarchy: Hierarchy<OBOGraphNode>;
};

function RenderedHierarchy(props: RenderedHierarchyProps) {
  const { hierarchy } = props;
  const ref = useRef<HierarchyTreeHandle>(null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <HierarchyTree
        key={hierarchy.root.uri}
        ref={ref}
        hierarchy={hierarchy}
        rootURI={hierarchy.root.uri}
        itemURI={hierarchy.root.uri}
        onSelectNode={node => {
          node;
        }}
      />
      <TermSearch
        nodes={hierarchy.items()}
        onSelectNode={node => {
          ref.current?.openAndFocusNode(node.uri);
        }}
      />
    </div>
  );
}

async function main() {
  const loader = new OBOGraphLoader();
  const graph = await loader.fromURI("data/pato-simple.json");

  const el = document.getElementById("application")!;
  const root = createRoot(el);
  const hierarchies = graph.getRootHierarchies();

  root.render(
    <div>
      {[...hierarchies.values()].map(hierarchy => (
        <RenderedHierarchy key={hierarchy.root.uri} hierarchy={hierarchy} />
      ))}
    </div>,
  );
}

main();
