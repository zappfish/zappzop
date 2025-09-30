import { useState, useEffect } from "preact/hooks";
import { Hierarchy, GraphNode } from "../graph"

type HierarchyTreeProps<T extends GraphNode = GraphNode> = {
  hierarchy: Hierarchy<T>;
  rootURI: string;
  itemURI: string;
  preferredPaths?: Array<string>;
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
  items: ReturnType<typeof Hierarchy.prototype.buildFlatTree>,
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

export default function HierarchyTree(props: HierarchyTreeProps) {
  const { hierarchy, preferredPaths, itemURI } = props
  const [usePreferredPaths, setUsePreferredPaths] = useState(false);
  const [expandPaths, setExpandPaths] = useState<Array<string>>([]);
  const [showRelations, setShowRelations] = useState(false);

  useEffect(() => {
    setExpandPaths([]);
  }, [itemURI]);

  const root = hierarchy.root;
  const item = hierarchy.getItem(itemURI);
  const items = hierarchy.buildFlatTree(item, {
    preferredPaths: usePreferredPaths ? preferredPaths : undefined,
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
              setUsePreferredPaths(prev => !prev);
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
                    item.uri !== root.uri ? undefined : "translate(12, 0)"
                  }
                >
                  <title>{item.uri}</title>
                  {showRelations ? relToParent + " " : ""}
                  {item.label}
                </text>

                {item.uri !== props.rootURI ? null : (
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
                  {hierarchy.graph.childrenByURI[item.uri]!.length === 0 ? null : (
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
