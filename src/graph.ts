import treeverse from "treeverse";
import { GraphNode } from "./types";
import Hierarchy from "./hierarchy";

type Relation = {
  to: string;
  predicate: string;
  inverse: boolean;
};

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
}
