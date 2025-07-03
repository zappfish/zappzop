import lunr from "lunr";
import treeverse from "treeverse";

export type LevelRelation = {
  // predicate: string;
  rel_uri: string;

  // object: string;
  uri: string;
};

export type OntologyTerm = {
  uri: string;
  label: string | null;
  children: Record<string, Array<string>>;
  parents: Record<string, Array<string>>;
};

type Relation = {
  to: string;
  predicate: string;
  inverse: boolean;
};

type FlatTreeOptions = {
  happyPaths?: Array<string>;
  expandPaths?: Array<string>;
};

export default class Ontology<T extends OntologyTerm> {
  root: T;
  items: Array<T>;
  itemsByURI: Record<string, T>;
  index: lunr.Index;

  childrenByURI: Record<string, Relation[]>;
  parentsByURI: Record<string, Relation[]>;

  constructor(items: Array<T>) {
    const itemsByURI: Record<string, T> = {};
    const parentsByURI: Record<string, Relation[]> = {};
    const childrenByURI: Record<string, Relation[]> = {};

    for (const item of items) {
      itemsByURI[item.uri] = item;

      for (const [relURI, termURIs] of Object.entries(item.children)) {
        termURIs.forEach(childURI => {
          if (!Object.hasOwn(childrenByURI, item.uri)) {
            childrenByURI[item.uri] = [];
          }

          if (!Object.hasOwn(parentsByURI, childURI)) {
            parentsByURI[childURI] = [];
          }

          childrenByURI[item.uri]!.push({
            to: childURI,
            predicate: relURI,
            inverse: false,
          });

          parentsByURI[childURI]!.push({
            to: item.uri,
            predicate: relURI,
            inverse: true,
          });
        });
      }

      for (const [relURI, termURIs] of Object.entries(item.parents)) {
        termURIs.forEach(parentURI => {
          if (!Object.hasOwn(parentsByURI, item.uri)) {
            parentsByURI[item.uri] = [];
          }

          if (!Object.hasOwn(childrenByURI, parentURI)) {
            childrenByURI[parentURI] = [];
          }

          parentsByURI[item.uri]!.push({
            to: parentURI,
            predicate: relURI,
            inverse: false,
          });

          childrenByURI[parentURI]!.push({
            to: item.uri,
            predicate: relURI,
            inverse: true,
          });
        });
      }

      if (!Object.hasOwn(childrenByURI, item.uri)) {
        childrenByURI[item.uri] = [];
      }
      if (!Object.hasOwn(parentsByURI, item.uri)) {
        parentsByURI[item.uri] = [];
      }
    }

    const root = items.find(item => parentsByURI[item.uri]!.length === 0);
    if (!root) throw Error();

    this.root = root;
    this.items = items;
    this.itemsByURI = itemsByURI;
    this.parentsByURI = parentsByURI;
    this.childrenByURI = childrenByURI;

    this.index = lunr(builder => {
      builder.ref("uri");
      builder.field("label");

      items.forEach(item => {
        builder.add(item);
      });
    });
  }

  getItem(uri: string) {
    const item = this.itemsByURI[uri];

    if (item === undefined) {
      throw new Error(`No item in ontology with URI ${uri}`);
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
        this.parentsByURI[node.uri]!.map(rel => this.getItem(rel.to)),
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
        this.childrenByURI[node.uri]!.map(rel => this.getItem(rel.to)),
    });

    children.shift();

    return children;
  }

  getTreeURIsForItem(item: T) {
    const uris = new Set([item.uri]);

    this.findAllParents(item).forEach(node => {
      uris.add(node.uri);
    });

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
        const childRelations = this.childrenByURI[node.item.uri]!;

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

            if (opts?.happyPaths) {
              const inHappyPath = opts.happyPaths.some(
                happyPathStr =>
                  happyPathStr.startsWith(pathStr) ||
                  pathStr.startsWith(happyPathStr),
              );

              if (!inHappyPath) continue;
            }
          }

          children.push({
            item: this.getItem(rel.to),
            relToParent: relPredicate,
            depth: node.depth + 1,
            path: pathStr,
            manuallyAdded,
          });
        }

        return children;
      },
    });

    return items;
  }
}
