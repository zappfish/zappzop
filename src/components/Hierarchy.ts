import { h } from "preact";
import { useState } from "preact/hooks";
import zfa from "../zfa";

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

  // zebrafish anatomical entity
  //   anatomical structure
  //     whole organism
  //       embryonic structure
  "ZFA:0100000-ZFA:0000037-ZFA:0001094-ZFA:0001105",
];

type HierarchyProps = {
  itemURI: string;
};

const d = {
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 20,
  tree: {
    itemHeight: 20,
    depthIndent: 20,
  },
};

function drawPathFor(
  items: ReturnType<typeof zfa.buildFlatTree>,
  curItemIdx: number,
) {
  const originItem = items[curItemIdx];
  let pathStr = "M5 0 ";
  let vIdx = 0;
  const horizontalTicksAt: Array<number> = [];

  for (const treeItem of items.slice(curItemIdx + 1)) {
    vIdx += 1;

    // This is an item one deeper in the hierarchy
    if (treeItem.depth === originItem.depth + 1) {
      horizontalTicksAt.push(vIdx);

      // Draw a line down to the current vertical position
      pathStr += `L 5 ${vIdx * d.tree.itemHeight - 10}`;

      // Draw a line horizontally and then back
      pathStr += `l ${d.tree.depthIndent - 12} 0`;
      pathStr += `m -${d.tree.depthIndent - 12} 0`;
    } else if (treeItem.depth <= originItem.depth) {
      break;
    }
  }

  return pathStr;
}

export default function Hierarchy(props: HierarchyProps) {
  const [useHappyPaths, setUseHappyPaths] = useState(false);
  const [showRelations, setShowRelations] = useState(false);
  const item = zfa.itemsByURI[props.itemURI];
  const items = zfa.buildFlatTree(item, useHappyPaths ? happyPaths : undefined);

  return h("div", null, [
    h("div", null, [
      h("label", null, [
        h("input", {
          type: "checkbox",
          onChange() {
            setShowRelations(prev => !prev);
          },
        }),
        " Show relations",
      ]),

      h("br", null),

      h("label", null, [
        h("input", {
          type: "checkbox",
          onChange() {
            setUseHappyPaths(prev => !prev);
          },
        }),
        " Use preferred paths",
      ]),
    ]),
    h("div", null, [
      h(
        "svg",
        {
          style: {
            border: "1px solid #ccc",
          },
          height:
            items.length * d.tree.itemHeight + d.paddingTop + d.paddingBottom,
          width: 1000,
        },
        [
          h(
            "g",
            {
              transform: `translate(${d.paddingLeft}, ${d.paddingTop})`,
            },
            items.map(({ item, depth, relToParent }, i) =>
              h(
                "g",
                {
                  transform: `translate(${depth * d.tree.depthIndent}, ${i * d.tree.itemHeight})`,
                  key: item.uri,
                },
                [
                  h("text", null, [
                    showRelations ? relToParent + " " : "",
                    item.label,
                  ]),

                  h("path", {
                    d: drawPathFor(items, i),
                    transform: "translate(5, 5)",
                    fill: "none",
                    stroke: "#666",
                    "stroke-width": 1,
                    "stroke-dasharray": "1",
                  }),
                ],
              ),
            ),
          ),
        ],
      ),
    ]),
  ]);
}
