import treeverse from "treeverse";

export type GraphNode = {
  uri: string;
  label: string | null;
  synonyms: Array<{
    value: string;
  }>;
  definitions: Array<{
    value: string;
  }>;
  children: Record<string, Array<string>>;
  parents: Record<string, Array<string>>;
};

type Relation = {
  to: string;
  predicate: string;
  inverse: boolean;
};

type FlatTreeOptions = {
  preferredPaths?: Array<string>;
  expandPaths?: Array<string>;
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
  // index: lunr.Index;

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

    /*
    this.index = lunr(builder => {
      builder.ref("uri");
      builder.field("label");

      items.forEach(item => {
        builder.add(item);
      });
    });
    */
  }

  items() {
    return this.items;
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
  nodesByURI: Record<string, T>;

  constructor(root: T, graph: Graph<T>) {
    this.root = root;
    this.graph = graph;
    this.nodesByURI = Object.fromEntries(
      this.items().map(node => [node.uri, node]),
    );
  }

  getItem(uri: string) {
    const item = this.nodesByURI[uri];

    if (item === undefined) {
      throw new Error(`No item in hierarchy with URI ${uri}`);
    }
    return item;
  }

  items() {
    return [this.root, ...this.graph.findAllChildren(this.root)];
  }

  getTreeURIsForItem(item: T) {
    const uris = new Set([item.uri]);

    if (!Object.hasOwn(this.nodesByURI, item.uri)) {
      throw new Error(`No item in hierarchy with URI ${item.uri}`);
    }

    for (const node of this.graph.findAllParents(item)) {
      uris.add(node.uri);
      if (node === this.root) {
        break;
      }
    }

    return uris;
  }

  buildFlatTree(leaf: T, opts?: FlatTreeOptions) {
    type ItemWithDepth = {
      item: T;
      relToParent: string | null;
      depth: number;
      path: string;
      manuallyAdded: boolean;
    };
    const items: Array<ItemWithDepth> = [];
    const treeURIs = this.getTreeURIsForItem(leaf);
    const path: Array<string> = [];

    treeverse.depth<ItemWithDepth, void, ItemWithDepth[]>({
      tree: {
        item: this.root,
        relToParent: null,
        depth: 0,
        path: this.root.uri,
        manuallyAdded: false,
      },
      visit(node) {
        items.push(node);
        path.push(node.item.uri);
      },
      leave() {
        path.pop();
      },
      getChildren: node => {
        const children: ItemWithDepth[] = [];
        const childRelations = this.graph.childrenByURI[node.item.uri]!;

        for (const rel of childRelations) {
          let manuallyAdded = false;

          const pathStr = [...path, rel.to].join("-");

          const relPredicate = !rel.inverse
            ? `^${rel.predicate}`
            : rel.predicate;

          if (opts?.expandPaths && opts.expandPaths.includes(path.join("-"))) {
            if (!treeURIs.has(rel.to)) {
              manuallyAdded = true;
            }
            // Great!
          } else {
            if (manuallyAdded) continue;
            if (!treeURIs.has(rel.to)) continue;

            if (opts?.preferredPaths) {
              const inPreferredPath = opts.preferredPaths.some(
                preferredPathStr =>
                  preferredPathStr.startsWith(pathStr) ||
                  pathStr.startsWith(preferredPathStr),
              );

              if (!inPreferredPath) continue;
            }
          }

          children.push({
            item: this.graph.getItem(rel.to),
            relToParent: relPredicate,
            depth: node.depth + 1,
            path: pathStr,
            manuallyAdded,
          });
        }

        children.sort((a, b) => graphLabelSort(a.item, b.item));

        return children;
      },
    });

    return items;
  }
}
