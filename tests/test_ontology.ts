import Graph, { GraphNode } from "../src/graph";
import t from "tap";

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

t.test("load a graph containing a tree", t => {
  const g = new Graph(nodes);

  const parents = g.findAllParents(nodes[3]!);
  t.equal(parents.length, 2);
  t.equal(parents[0], nodes[2]);
  t.equal(parents[1], nodes[0]);

  const children = g.findAllChildren(nodes[0]!);
  t.equal(children.length, 3);

  t.equal(g.getItem("ex:A"), nodes[0]);

  t.match(g.roots, [nodes[0]], "should find root nodes");

  t.end();
});

t.test("build a hierarchy", t => {
  const g = new Graph(nodes);

  t.match(g.getHierarchy("ex:A").items(), [
    { uri: "ex:A" },
    { uri: "ex:B" },
    { uri: "ex:C" },
    { uri: "ex:D" },
  ]);

  t.match(g.getHierarchy("ex:C").items(), [{ uri: "ex:C" }, { uri: "ex:D" }]);

  t.end();
});

t.test("build a flat tree", t => {
  const o = new Graph(nodes);
  const leaf = o.getItem("ex:D");

  t.match(o.getHierarchy("ex:A").buildFlatTree(leaf), [
    { item: { uri: "ex:A" }, relToParent: null, depth: 0 },
    { item: { uri: "ex:C" }, relToParent: "rdfs:subClassOf", depth: 1 },
    { item: { uri: "ex:D" }, relToParent: "rdfs:subClassOf", depth: 2 },
  ]);

  t.end();
});

t.test("build a flat tree with one level manually expanded", t => {
  const o = new Graph(nodes);
  const leaf = o.getItem("ex:D");
  const tree = o.getHierarchy("ex:A").buildFlatTree(leaf, {
    expandPaths: ["ex:A"],
  });

  t.match(tree, [
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

  t.end();
});
