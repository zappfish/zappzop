import { h, render } from "preact";
// import Main from "./components/Main";
import HierarchyTree from "./components/Hierarchy";
import OBOGraphLoader from "./loaders/obograph/index";

// const el = document.getElementById("application")!;
// render(h(Main, null), el);
async function main() {
  const loader = new OBOGraphLoader();
  const graph = await loader.fromURI("zfa.json");

  const el = document.getElementById("application")!;
  const hierarchies = graph.getRootHierarchies()
  const hierarchyEls = [...hierarchies.values()].map(hierarchy => (
    h(HierarchyTree, {
      hierarchy,
      rootURI: hierarchy.root.uri,
      itemURI: hierarchy.root.uri,
    })
  ))
  render(h("div", null, hierarchyEls), el);
}

main()
