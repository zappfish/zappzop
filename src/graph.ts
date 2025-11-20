import treeverse from "treeverse";
import { GraphNode } from "./types";

type Relation = {
  to: string;
  predicate: string;
  inverse: boolean;
};

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

export default class Graph<T extends GraphNode> {
  roots: Array<T>;
  nodes: Array<T>;
  nodesByURI: Record<string, T>;

  childrenByURI: Record<string, Relation[]>;
  parentsByURI: Record<string, Relation[]>;

  constructor(nodes: Array<T>) {
    const nodesByURI: Record<string, T> = {};
    const parentsByURI: Record<string, Relation[]> = {};
    const childrenByURI: Record<string, Relation[]> = {};

    for (const node of nodes) {
      nodesByURI[node.uri] = node;

      for (const [relURI, termURIs] of Object.entries(node.children)) {
        termURIs.forEach(childURI => {
          if (!Object.hasOwn(childrenByURI, node.uri)) {
            childrenByURI[node.uri] = [];
          }

          if (!Object.hasOwn(parentsByURI, childURI)) {
            parentsByURI[childURI] = [];
          }

          childrenByURI[node.uri]!.push({
            to: childURI,
            predicate: relURI,
            inverse: false,
          });

          parentsByURI[childURI]!.push({
            to: node.uri,
            predicate: relURI,
            inverse: true,
          });
        });
      }

      for (const [relURI, termURIs] of Object.entries(node.parents)) {
        termURIs.forEach(parentURI => {
          if (!Object.hasOwn(parentsByURI, node.uri)) {
            parentsByURI[node.uri] = [];
          }

          if (!Object.hasOwn(childrenByURI, parentURI)) {
            childrenByURI[parentURI] = [];
          }

          parentsByURI[node.uri]!.push({
            to: parentURI,
            predicate: relURI,
            inverse: false,
          });

          childrenByURI[parentURI]!.push({
            to: node.uri,
            predicate: relURI,
            inverse: true,
          });
        });
      }

      if (!Object.hasOwn(childrenByURI, node.uri)) {
        childrenByURI[node.uri] = [];
      }
      if (!Object.hasOwn(parentsByURI, node.uri)) {
        parentsByURI[node.uri] = [];
      }
    }

    const roots = nodes.filter(
      item =>
        parentsByURI[item.uri]!.length === 0 &&
        childrenByURI[item.uri]!.length > 0,
    );

    this.roots = roots;
    this.nodes = nodes;
    this.nodesByURI = nodesByURI;
    this.parentsByURI = parentsByURI;
    this.childrenByURI = childrenByURI;
  }

  items() {
    return this.nodes;
  }

  getHierarchy(rootURI: string) {
    const item = this.getItem(rootURI);
    return new Hierarchy(item, this);
  }

  getRootHierarchies() {
    const ret: Map<string, Hierarchy<T>> = new Map();

    this.roots.forEach(root => {
      ret.set(root.uri, this.getHierarchy(root.uri));
    });

    return ret;
  }

  getItem(uri: string) {
    const item = this.nodesByURI[uri];

    if (item === undefined) {
      throw new Error(`No item in graph with URI ${uri}`);
    }
    return item;
  }

  findAllParents(item: T) {
    const parents: Array<T> = [];

    treeverse.breadth({
      tree: item,
      visit(item) {
        parents.push(item);
      },
      getChildren: node =>
        this.parentsByURI[node.uri]!.map(rel => this.getItem(rel.to)).sort(
          graphLabelSort,
        ),
    });

    parents.shift();

    return parents;
  }

  findAllChildren(item: T) {
    const children: Array<T> = [];

    treeverse.breadth({
      tree: item,
      visit(item) {
        children.push(item);
      },
      getChildren: node =>
        this.childrenByURI[node.uri]!.map(rel => this.getItem(rel.to)).sort(
          graphLabelSort,
        ),
    });

    children.shift();

    return children;
  }
}

export class Hierarchy<T extends GraphNode> {
  root: T;
  graph: Graph<T>;

  nodesByURI: Map<string, T>;
  nodesByPathKey: Map<string, T>;
  pathsByURI: Map<string, Path[]>;

  constructor(root: T, graph: Graph<T>) {
    this.root = root;
    this.graph = graph;
    this.nodesByURI = new Map()
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
          }
        });

        children.sort((a, b) => graphLabelSort(a.item, b.item))

        return children;
      },
    });

    return rows;
  }
}

export class Path {
  steps: Array<string>;

  constructor(steps: Array<string>) {
    this.steps = steps;
  }

  get key() {
    return JSON.stringify(this.steps);
  }

  static fromKey(k: string) {
    return new Path(JSON.parse(k));
  }

  depth() {
    return this.steps.length;
  }

  hasAncestor(other: Path) {
    if (other.steps.length > this.steps.length) return false;
    return other.steps.every((val, i) => val === this.steps[i]);
  }

  equals(other: Path) {
    if (other.steps.length !== this.steps.length) return false;
    return this.steps.every((v, i) => v === other.steps[i]);
  }

  parent(): Path | null {
    if (this.steps.length <= 1) return null;
    return new Path(this.steps.slice(0, -1));
  }

  child(uri: string): Path {
    return new Path([...this.steps, uri]);
  }
}
