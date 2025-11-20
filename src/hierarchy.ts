import treeverse from "treeverse";

import { GraphNode } from "./types";
import Path from "./path";
import Graph from "./graph";

type FlatTreeOptions = {
  showNodes?: Path[];
  expandNodes?: Path[];
};

// FIXME: this is a horrible name, and it should go somewhere else
export function graphLabelSort(a: GraphNode, b: GraphNode) {
  const aLabel = a.label;
  const bLabel = b.label;

  if (aLabel === bLabel) return 0;
  if (!aLabel) return -1;
  if (!bLabel) return 1;

  return aLabel.localeCompare(bLabel);
}

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

  getItem(uri: string) {
    const item = this.nodesByURI.get(uri);

    if (item === undefined) {
      throw new Error(`No item in hierarchy with URI ${uri}`);
    }
    return item;
  }

  items() {
    return this.nodesByURI.values();
  }

  getPathsForNode(uri: string) {
    return this.pathsByURI.get(uri) ?? [];
  }

  getItemAtPath(path: Path) {
    const item = this.nodesByPathKey.get(path.key);
    if (!item) throw new Error(`No such path: ${path.key}`);
    return item;
  }

  buildFlatTree(opts: FlatTreeOptions = {}) {
    const showNodes = opts.showNodes ?? [];
    const expandNodes = opts.expandNodes ?? [];

    const showKeys = new Set(showNodes.map(p => p.key));
    const expandKeys = new Set(expandNodes.map(p => p.key));

    const rows: Array<{
      item: T;
      relToParent: string | null;
      depth: number;
      path: Path;
    }> = [];

    const shouldExpandPath = (path: Path) => {
      if (expandKeys.has(path.key)) return true;

      if (expandNodes.some(expandPath => expandPath.hasAncestor(path)))
        return true;

      return false;
    };

    const shouldShowPath = (path: Path) => {
      // Always show the root
      if (path.depth() === 1) return true;

      if (showKeys.has(path.key)) return true;

      for (const expandPath of expandNodes) {
        // This is an ancestor of an expanded node, or the expanded node itself
        if (expandPath.hasAncestor(path)) return true;

        // This is the direct child of an node to be expanded
        if (path.parent()?.equals(expandPath)) return true;
      }

      return false;
    };

    treeverse.depth({
      tree: {
        item: this.root,
        path: new Path([this.root.uri]),
        depth: 0,
        relToParent: null as null | string,
      },

      visit(node) {
        const { item, path, depth, relToParent } = node;

        if (shouldShowPath(path)) {
          rows.push({ item, path, depth, relToParent });
        }
      },

      getChildren: node => {
        const { item, path, depth } = node;

        if (!shouldExpandPath(path)) {
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
          };
        });

        children.sort((a, b) => graphLabelSort(a.item, b.item));

        return children;
      },
    });

    return rows;
  }
}
