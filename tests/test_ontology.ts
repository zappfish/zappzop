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

    const fromA = g
      .getHierarchy("ex:A")
      .items()
      .map(x => x.uri);

    expect(fromA).toEqual(
      expect.arrayContaining(["ex:A", "ex:B", "ex:C", "ex:D"]),
    );

    const fromC = g
      .getHierarchy("ex:C")
      .items()
      .map(x => x.uri);

    expect(fromC).toEqual(
      expect.arrayContaining(["ex:C", "ex:D"]),
    );
  });

  test("build a flat tree", () => {
    const o = new Graph(nodes);

    expect(
      o.getHierarchy("ex:A").buildFlatTree()
    ).toMatchObject([
      { item: { uri: "ex:A" }, relToParent: null, depth: 0 },
    ])

    expect(o.getHierarchy("ex:A").buildFlatTree({
      showNodes: [new Path(["ex:A", "ex:C", "ex:D"])],
    })).toMatchObject([
      { item: { uri: "ex:A" }, relToParent: null, depth: 0 },
      { item: { uri: "ex:C" }, relToParent: "rdfs:subClassOf", depth: 1 },
      { item: { uri: "ex:D" }, relToParent: "rdfs:subClassOf", depth: 2 },
    ]);
  });

  test("build a flat tree with one level manually expanded", () => {
    const o = new Graph(nodes);
    const tree = o.getHierarchy("ex:A").buildFlatTree({
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
    ]);
  });
});
