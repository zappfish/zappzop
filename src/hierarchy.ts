import treeverse from "treeverse";

import { GraphNode } from "./types";
import Path from "./path";
import Graph from "./graph";
import { sortByLabel } from "./util";

type FlatViewOptions = {
  showNodes?: Array<Path>;
  expandNodes?: Array<Path>;
};

type HierarchyRow<T extends GraphNode> = {
  item: T;
  relToParent: string | null;
  depth: number;
  path: Path;
};

export default class Hierarchy<T extends GraphNode> {
  root: T;
  graph: Graph<T>;

  nodesByURI: Map<string, T>;
  nodesByPathKey: Map<string, T>;
  pathsByURI: Map<string, Path[]>;

  constructor(root: T, graph: Graph<T>) {
    this.root = root;
    this.graph = graph;
    this.nodesByURI = new Map();
    this.nodesByPathKey = new Map();
    this.pathsByURI = new Map();

    // Precompute all indexes ahead of time. This consists of:
    //   1. A map indexing nodes by URI
    //   2. A map indexing nodes by path key
    //   3. A map indexing paths by URI
    treeverse.depth({
      tree: {
        item: this.root,
        path: new Path([this.root.uri]),
      },

      visit: node => {
        const { item, path } = node;

        if (!this.pathsByURI.has(item.uri)) {
          this.pathsByURI.set(item.uri, []);
        }

        this.nodesByURI.set(item.uri, item);
        this.pathsByURI.get(item.uri)!.push(path);
        this.nodesByPathKey.set(path.key, item);
      },

      getChildren: node => {
        const { item, path } = node;
        const childRels = this.graph.childrenByURI[item.uri] ?? [];

        return childRels.map(rel => {
          const child = this.graph.getItem(rel.to);

          return {
            item: child,
            path: path.child(child.uri),
          };
        });
      },
    });
  }

  getNode(node: string | T | Path) {
    if (typeof node === "string") {
      const ret = this.nodesByURI.get(node);

      if (!ret) {
        throw new Error(`No item in hierarchy with URI ${node}`);
      }

      return ret;
    } else if (node instanceof Path) {
      const ret = this.nodesByPathKey.get(node.key);

      if (!ret) {
        throw new Error(`No item in hierarchy at path ${node.key}`);
      }

      return ret;
    } else {
      return node;
    }
  }

  items() {
    return [...this.nodesByURI.values()].sort(sortByLabel);
  }

  getPathsForNode(node: string | T) {
    const _node = this.getNode(node);
    return this.pathsByURI.get(_node.uri) ?? [];
  }

  // Produce a projection of this hierarchy, with only certain nodes shown or
  // expanded. Meant for producing a portion of the hierarchy suitable for
  // rendering in a UI.
  //
  // Returns a one-dimensional array of HierarchyRow objects annotated by their
  // depth.
  projectFlatView(opts: FlatViewOptions = {}) {
    const showNodes = opts.showNodes ?? [];
    const expandNodes = opts.expandNodes ?? [];

    const showKeys = new Set(showNodes.map(p => p.key));
    const expandKeys = new Set(expandNodes.map(p => p.key));

    const rows: Array<HierarchyRow<T>> = [];

    const shouldIterateChildren = (path: Path) => {
      // This is an expanded node-- iterate its children.
      if (expandKeys.has(path.key)) return true;

      // This is an ancestor of a shown path-- iterate its children.
      if (showNodes.some(showPath => path.isAncestorOf(showPath))) return true;

      // This node is an ancestor of an expanded path-- iterate its children.
      if (expandNodes.some(expandPath => path.isAncestorOf(expandPath)))
        return true;

      return false;
    };

    const shouldShowPath = (path: Path) => {
      const pathKey = path.key;

      // Always show the root
      if (path.depth() === 1) return true;

      // This is an expanded node
      if (expandKeys.has(pathKey)) return true;

      // This is a shown node
      if (showKeys.has(pathKey)) return true;

      for (const showPath of showNodes) {
        // This is an ancestor of an shown node
        if (path.isAncestorOf(showPath)) return true;
      }

      for (const expandPath of expandNodes) {
        // This is an ancestor of an expanded node
        if (path.isAncestorOf(expandPath)) return true;

        // This is the direct child of an expanded node
        if (path.parent()?.equals(expandPath)) return true;
      }

      return false;
    };

    treeverse.depth({
      tree: {
        item: this.root,
        path: new Path([this.root.uri]),
        depth: 0,
        relToParent: null,
      } as HierarchyRow<T>,

      visit(node) {
        const { item, path, depth, relToParent } = node;

        if (shouldShowPath(path)) {
          rows.push({ item, path, depth, relToParent });
        }
      },

      getChildren: node => {
        const { item, path, depth } = node;

        if (!shouldIterateChildren(path)) {
          return [];
        }

        const childRels = this.graph.childrenByURI[item.uri] ?? [];

        const children = childRels.map(rel => {
          const item = this.graph.getItem(rel.to);
          const relPredicate = !rel.inverse
            ? `^${rel.predicate}`
            : rel.predicate;

          return {
            item,
            path: path.child(item.uri),
            depth: depth + 1,
            relToParent: relPredicate,
          } as HierarchyRow<T>;
        });

        // Sort in reverse alphabetical order-- the last node is visited first.
        children.sort((a, b) => sortByLabel(b.item, a.item));

        return children;
      },
    });

    return rows;
  }
}
