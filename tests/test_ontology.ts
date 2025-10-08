import Graph, { GraphNode } from "../src/graph";
import { test, expect, describe } from "vitest";

const nodes: GraphNode[] = [
  {
    uri: "ex:A",
    label: "A",
    parents: {},
    children: {},
  },

  {
    uri: "ex:B",
    label: "B",
    parents: {
      "rdfs:subClassOf": ["ex:A"],
    },
    children: {},
  },

  {
    uri: "ex:C",
    label: "C",
    parents: {
      "rdfs:subClassOf": ["ex:A"],
    },
    children: {},
  },

  {
    uri: "ex:D",
    label: "D",
    parents: {
      "rdfs:subClassOf": ["ex:C"],
    },
    children: {},
  },
];

describe("Graph", () => {
  test("load a graph containing a tree", () => {
    const g = new Graph(nodes);

    const parents = g.findAllParents(nodes[3]!);
    expect(parents.length).toBe(2);
    expect(parents[0]).toBe(nodes[2]);
    expect(parents[1]).toBe(nodes[0]);

    const children = g.findAllChildren(nodes[0]!);
    expect(children.length).toBe(3);

    expect(g.getItem("ex:A")).toBe(nodes[0]);

    expect(g.roots, "should find root nodes").toMatchObject([nodes[0]]);
  });
});

describe("Hierarchy", () => {
  test("build a hierarchy", () => {
    const g = new Graph(nodes);

    expect(g.getHierarchy("ex:A").items()).toMatchObject([
      { uri: "ex:A" },
      { uri: "ex:B" },
      { uri: "ex:C" },
      { uri: "ex:D" },
    ]);

    expect(g.getHierarchy("ex:C").items()).toMatchObject([
      { uri: "ex:C" },
      { uri: "ex:D" },
    ]);
  });

  test("build a flat tree", () => {
    const o = new Graph(nodes);
    const leaf = o.getItem("ex:D");

    expect(o.getHierarchy("ex:A").buildFlatTree(leaf)).toMatchObject([
      { item: { uri: "ex:A" }, relToParent: null, depth: 0 },
      { item: { uri: "ex:C" }, relToParent: "rdfs:subClassOf", depth: 1 },
      { item: { uri: "ex:D" }, relToParent: "rdfs:subClassOf", depth: 2 },
    ]);
  });

  test("build a flat tree with one level manually expanded", () => {
    const o = new Graph(nodes);
    const leaf = o.getItem("ex:D");
    const tree = o.getHierarchy("ex:A").buildFlatTree(leaf, {
      expandPaths: ["ex:A"],
    });

    expect(tree).toMatchObject([
      {
        item: { uri: "ex:A" },
        relToParent: null,
        depth: 0,
        manuallyAdded: false,
      },
      {
        item: { uri: "ex:B" },
        relToParent: "rdfs:subClassOf",
        depth: 1,
        manuallyAdded: true,
      },
      {
        item: { uri: "ex:C" },
        relToParent: "rdfs:subClassOf",
        depth: 1,
        manuallyAdded: false,
      },
      {
        item: { uri: "ex:D" },
        relToParent: "rdfs:subClassOf",
        depth: 2,
        manuallyAdded: false,
      },
    ]);
  });
});
