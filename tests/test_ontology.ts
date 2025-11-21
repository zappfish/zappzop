import Graph from "../src/graph";
import Path from "../src/path";
import { GraphNode } from "../src/types";
import { test, expect, describe } from "vitest";

const nodes: GraphNode[] = [
  {
    uri: "ex:A",
    label: "A",
    parents: {},
    children: {},
    synonyms: [],
    definitions: [],
  },

  {
    uri: "ex:B",
    label: "B",
    parents: {
      "rdfs:subClassOf": ["ex:A"],
    },
    children: {},
    synonyms: [],
    definitions: [],
  },

  {
    uri: "ex:C",
    label: "C",
    parents: {
      "rdfs:subClassOf": ["ex:A"],
    },
    children: {},
    synonyms: [],
    definitions: [],
  },

  {
    uri: "ex:D",
    label: "D",
    parents: {
      "rdfs:subClassOf": ["ex:C"],
    },
    children: {},
    synonyms: [],
    definitions: [],
  },

  {
    uri: "ex:E",
    label: "E",
    parents: {
      "rdfs:subClassOf": ["ex:A", "ex:B"],
    },
    children: {},
    synonyms: [],
    definitions: [],
  },
];

describe("Graph", () => {
  test("load a graph containing a tree", () => {
    const g = new Graph(nodes);

    const parents = g.findAllParents(g.getItem("ex:D"));
    expect(parents.length).toBe(2);
    expect(parents[0]).toBe(g.getItem("ex:C"));
    expect(parents[1]).toBe(g.getItem("ex:A"));

    const children = g.findAllChildren(g.getItem("ex:A"));
    expect(children.length).toBe(4);

    expect(g.roots, "should find root nodes").toMatchObject([
      g.getItem("ex:A"),
    ]);
  });
});

describe("Hierarchy", () => {
  test("build a hierarchy", () => {
    const g = new Graph(nodes);

    // TODO: This tests whether labels are in alphabetical order (by label) as
    // well. Should it be so?
    expect(g.getHierarchy("ex:A").items()).toMatchObject([
      { uri: "ex:A" },
      { uri: "ex:B" },
      { uri: "ex:C" },
      { uri: "ex:D" },
      { uri: "ex:E" },
    ]);

    expect(g.getHierarchy("ex:C").items()).toMatchObject([
      { uri: "ex:C" },
      { uri: "ex:D" },
    ]);
  });

  test("build a flat tree", () => {
    const o = new Graph(nodes);

    expect(o.getHierarchy("ex:A").projectFlatView()).toMatchObject([
      { item: { uri: "ex:A" }, relToParent: null, depth: 0 },
    ]);

    expect(
      o.getHierarchy("ex:A").projectFlatView({
        showNodes: [new Path(["ex:A", "ex:C", "ex:D"])],
      }),
    ).toMatchObject([
      { item: { uri: "ex:A" }, relToParent: null, depth: 0 },
      { item: { uri: "ex:C" }, relToParent: "rdfs:subClassOf", depth: 1 },
      { item: { uri: "ex:D" }, relToParent: "rdfs:subClassOf", depth: 2 },
    ]);
  });

  test("build a flat tree with one level manually expanded", () => {
    const o = new Graph(nodes);

    const tree = o.getHierarchy("ex:A").projectFlatView({
      expandNodes: [new Path(["ex:A"])],
      showNodes: [new Path(["ex:A", "ex:C", "ex:D"])],
    });

    expect(tree).toMatchObject([
      {
        item: { uri: "ex:A" },
        relToParent: null,
        depth: 0,
      },
      {
        item: { uri: "ex:B" },
        relToParent: "rdfs:subClassOf",
        depth: 1,
      },
      {
        item: { uri: "ex:C" },
        relToParent: "rdfs:subClassOf",
        depth: 1,
      },
      {
        item: { uri: "ex:D" },
        relToParent: "rdfs:subClassOf",
        depth: 2,
      },
      {
        item: { uri: "ex:E" },
        relToParent: "rdfs:subClassOf",
        depth: 1,
      },
    ]);
  });

  test("get all paths to a node in a hierarchy", () => {
    const o = new Graph(nodes);
    const tree = o.getHierarchy("ex:A");
    expect(tree.getPathsForNode("ex:D")).toMatchObject([
      new Path(["ex:A", "ex:C", "ex:D"]),
    ]);
    expect(tree.getPathsForNode("ex:E")).toMatchObject([
      new Path(["ex:A", "ex:E"]),
      new Path(["ex:A", "ex:B", "ex:E"]),
    ]);
  });
});
