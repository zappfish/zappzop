import Ontology, { OntologyTerm } from "../src/ontology";
// import test from "tape"
import { test } from "tap";

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

test("load well formed ontology", t => {
  const o = new Ontology(items);
  t.equal(o.root, items[0], "should find root node");

  const parents = o.findAllParents(items[3]);
  t.equal(parents.length, 2);
  t.equal(parents[0], items[2]);
  t.equal(parents[1], items[0]);

  const children = o.findAllChildren(items[0]);
  t.equal(children.length, 3);

  t.equal(o.getItem("ex:A"), items[0]);

  t.same(o.buildFlatTree(items[3]), [
    { item: items[0], relToParent: null, depth: 0 },
    { item: items[2], relToParent: "rdfs:subClassOf", depth: 1 },
    { item: items[3], relToParent: "rdfs:subClassOf", depth: 2 },
  ]);

  t.end();
});
