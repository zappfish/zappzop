import { h } from "preact"
import * as treeverse from "treeverse"
import { useState } from "preact/hooks"
import hierarchy from "../hierarchy.json"
import lunr from "lunr"

type HierarchyRelation = {
  uri: string;
  rel_uri: string;
  rel_label: string;
}

type HierarchyItem = {
  uri: string;
  label: string;
  synonyms: Array<string>;
  children: Array<HierarchyRelation>;
  parents: Array<HierarchyRelation>;
  zfin_usage: number;
}

type Hierarchy = {
  root: HierarchyItem;
  itemsByURI: Record<string, HierarchyItem>;
}

function buildTree(items: Array<HierarchyItem>): Hierarchy {
  const root = items.find(item => item.parents.length == 0)
  if (!root) throw Error();
  const itemsByURI = Object.fromEntries(items.map(item => [item.uri, item]))

  return { root, itemsByURI }
}

const tree = buildTree(hierarchy.items)

const happyPaths = [
  // zebrafish anatomical entity
  //   anatomical structure
  //     whole organism
  //       organism subdivision
  "ZFA:0100000-ZFA:0000037-ZFA:0001094-ZFA:0001308",

  // zebrafish anatomical entity
  //   anatomical structure
  //     whole organism
  //       anatomical system
  "ZFA:0100000-ZFA:0000037-ZFA:0001094-ZFA:0001439",
]

function buildIndividualTree(
  tree: Hierarchy,
  leaf: HierarchyItem,
  useHappyPaths: boolean,
) {
  const includedURIs = new Set()

  const items: Array<{
    item: HierarchyItem,
    relToParent: string,
    depth: number,
  }> = []

  function addItem(_item: HierarchyItem) {
    includedURIs.add(_item.uri)

    for (const { uri } of _item.parents) {
      includedURIs.add(uri)
      const parentItem = tree.itemsByURI[uri]
      addItem(parentItem)
    }
  }

  addItem(leaf)

  const path: Array<string> = []

  treeverse.depth({
    tree: {
      root: tree.root,
      depth: 0,
      relToParent: '',
    },
    visit(node) {
      items.push({
        item: node.root,
        depth: node.depth,
        relToParent: node.relToParent,
      })
      path.push(node.root.uri)

      if (node.root == leaf) {
        const terminalPath = `S${path.join("-")}E`;
        console.log("terminal path", terminalPath)
      }
      return node;
    },
    leave(node) {
      path.pop()
      return node
    },
    getChildren(node) {
      return node.root.children
        .filter(childRelation => {
          if (!includedURIs.has(childRelation.uri)) return false;
          if (!useHappyPaths) return true

          const pathStr = [...path, childRelation.uri].join("-");

          const inHappyPath = happyPaths.some(happyPathStr => (
            happyPathStr.startsWith(pathStr) ||
              pathStr.startsWith(happyPathStr)
          ))

          return inHappyPath
        })
        .map(({ uri, rel_uri }) => ({
          root: tree.itemsByURI[uri],
          relToParent: rel_uri,
          depth: node.depth + 1,
        }))
    }
  })

  return { items }
}

type HierarchyProps = {
  itemURI: string;
}

const index = lunr((builder) => {
  builder.ref("uri");
  builder.field("label");

  for (const item of Object.values(tree.itemsByURI)) {
    builder.add(item)
  }
})

type HierarchyItemProps = {
  uri: string;
  onSelect?: (item: HierarchyItem) => void;
}

function HierarchyItem(props: HierarchyItemProps) {
  const item = tree.itemsByURI[props.uri]

  return (
    h("span", null, [
      h("a", {
        href: "http://purl.obolibrary.org/obo/ZFA_" + item.uri.slice(4),
        onClick(e: MouseEvent) {
          if (!props.onSelect) return true;

          e.preventDefault();
          props.onSelect(item)
        },
      }, item.label),
      ` (${item.zfin_usage} self) `,
    ])
  )
}

const d = {
  paddingTop: 20,
  paddingBottom: 20,
  tree: {
    itemHeight: 20,
    depthIndent: 20,
  }
}

export function Hierarchy(props: HierarchyProps) {
  const [ useHappyPaths, setUseHappyPaths ] = useState(false)
  const [ showRelations, setShowRelations ] = useState(false)
  const item = tree.itemsByURI[props.itemURI]
  const { items } = buildIndividualTree(tree, item, useHappyPaths)

  return (
    h("div", null, [
      h("div", null, [
        h("label", null, [
          "Show relations",
          h("input", {
            type: "checkbox",
            onChange() {
              setShowRelations(prev => !prev)
            },
          }),
        ]),

        h("br", null),

        h("label", null, [
          "Use happy path",
          h("input", {
            type: "checkbox",
            onChange() {
              setUseHappyPaths(prev => !prev)
            },
          }),
        ]),
      ]),
      h("div", null, [
        h("svg", {
          style: {
            border: "1px solid #ccc",
          },
          height: items.length * d.tree.itemHeight + d.paddingTop + d.paddingBottom,
          width: 1000,
        }, [
          h("g", {
            transform: `translate(0, ${d.paddingTop})`,
          }, items.map(({ item, depth, relToParent }, i) => (
            h("g", {
              transform: `translate(${depth * d.tree.depthIndent}, ${i * d.tree.itemHeight})`,
              key: item.uri,
              style: {
                marginLeft: `${depth * 1.5}em`,
              },
            }, [
              // relToParent,
              // " ",
              h("text", null, [
                showRelations ? relToParent + " " : '',
                item.label
              ])
            ])
          )))
        ]),
      ]),
    ])
  )
}

type SearchProps = {
  onItemSelect: (itemURI: string) => void;
}

export function Search(props: SearchProps) {
  const [ searchResult, setSearchResult ] = useState<lunr.Index.Result[]>([])

  return (
    h("div", null, [
      h("div", null, h("input", {
        type: "text",
        onInput(e) {
          setSearchResult(index.search(e.currentTarget.value + "*").slice(0, 100))
        }
      })),

      h("ul", null, searchResult.map(result => (
        h("li", {
          key: result.ref
        }, [
          h(HierarchyItem, {
            uri: result.ref,
            onSelect(item) {
              props.onItemSelect(item.uri)
            }
          })
        ])
      )))
    ])
  )
}
