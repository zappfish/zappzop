import Ontology, { OntologyTerm } from "../src/ontology";
import t from "tap";

const items: OntologyTerm[] = [
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

t.test("load well formed ontology", t => {
  const o = new Ontology(items);
  t.equal(o.root, items[0], "should find root node");

  const parents = o.findAllParents(items[3]!);
  t.equal(parents.length, 2);
  t.equal(parents[0], items[2]);
  t.equal(parents[1], items[0]);

  const children = o.findAllChildren(items[0]!);
  t.equal(children.length, 3);

  t.equal(o.getItem("ex:A"), items[0]);

  t.end();
});

t.test("build a flat tree", t => {
  const o = new Ontology(items);

  t.match(o.buildFlatTree(items[3]!), [
    { item: { uri: "ex:A" }, relToParent: null, depth: 0 },
    { item: { uri: "ex:C" }, relToParent: "rdfs:subClassOf", depth: 1 },
    { item: { uri: "ex:D" }, relToParent: "rdfs:subClassOf", depth: 2 },
  ]);

  t.end();
});

t.test("build a flat tree with one level manually expanded", t => {
  const o = new Ontology(items);
  const tree = o.buildFlatTree(items[3]!, {
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
