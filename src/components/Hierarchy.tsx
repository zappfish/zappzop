import { useState, useEffect } from "preact/hooks";
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
  const originItem = items[curItemIdx]!;

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
  const [expandPaths, setExpandPaths] = useState<Array<string>>([]);
  const [showRelations, setShowRelations] = useState(false);

  useEffect(() => {
    setExpandPaths([]);
  }, [props.itemURI]);

  const item = zfa.itemsByURI[props.itemURI]!;
  const items = zfa.buildFlatTree(item, {
    happyPaths: useHappyPaths ? happyPaths : undefined,
    expandPaths: expandPaths.length ? expandPaths : undefined,
  });

  return (
    <div>
      <div>
        <label>
          <input
            type="checkbox"
            onChange={() => {
              setShowRelations(prev => !prev);
            }}
          />
          Show relations
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            onChange={() => {
              setUseHappyPaths(prev => !prev);
            }}
          />
          Use preferred paths
        </label>
      </div>

      <div>
        <svg
          style={{
            border: "1px solid #ccc",
          }}
          height={
            items.length * d.tree.itemHeight + d.paddingTop + d.paddingBottom
          }
          width={1000}
        >
          <g transform={`translate(${d.paddingLeft}, ${d.paddingTop})`}>
            {items.map(({ item, depth, relToParent, path }, i) => (
              <g
                transform={`translate(${depth * d.tree.depthIndent}, ${i * d.tree.itemHeight})`}
                key={item.uri}
              >
                <text
                  transform={
                    item.uri !== props.itemURI ? undefined : "translate(12, 0)"
                  }
                >
                  <title>item.uri</title>
                  {showRelations ? relToParent + " " : ""}
                  {item.label}
                </text>

                {item.uri !== props.itemURI ? null : (
                  <circle
                    cx={5}
                    cy={-d.tree.itemHeight / 4}
                    r={3}
                    fill={"red"}
                  />
                )}

                <path
                  d={drawPathFor(items, i)}
                  transform={"translate(5, 5)"}
                  fill={"none"}
                  stroke={"#666"}
                  stroke-width={1}
                  stroke-dasharray={"1"}
                />

                <g>
                  {zfa.childrenByURI[item.uri]!.length === 0 ? null : (
                    <rect
                      x={-14}
                      y={-d.tree.itemHeight / 2}
                      width={10}
                      height={10}
                      onClick={() => {
                        if (expandPaths.includes(path)) {
                          setExpandPaths(prev => prev.filter(p => p !== path));
                        } else {
                          setExpandPaths(prev => [...prev, path]);
                        }
                      }}
                      fill={expandPaths.includes(path) ? "#ccc" : "white"}
                      fill-opacity={0.9}
                      stroke="black"
                      strokeWidth={1}
                    />
                  )}
                </g>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
