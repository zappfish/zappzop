import { useState, useEffect } from "react";
import { Hierarchy, GraphNode } from "../graph";

type HierarchyTreeProps<T extends GraphNode = GraphNode> = {
  hierarchy: Hierarchy<T>;
  rootURI: string;
  itemURI: string;
  preferredPaths?: Array<string>;
  width?: number;
  onSelectNode?: (node: T) => void;
};

const d = {
  width: 1000,
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 40,
  tree: {
    itemHeight: 20,
    depthIndent: 20,
  },
};

const SELECTION_MARKER = ">";

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
  const { hierarchy, preferredPaths, itemURI } = props;
  const [usePreferredPaths, setUsePreferredPaths] = useState(false);
  const [expandPaths, setExpandPaths] = useState<Set<string>>(new Set());
  const [showRelations, setShowRelations] = useState(false);

  useEffect(() => {
    setExpandPaths(new Set());
  }, [itemURI]);

  const root = hierarchy.root;
  const item = hierarchy.getItem(itemURI);
  const items = hierarchy.buildFlatTree(item, {
    preferredPaths: usePreferredPaths ? preferredPaths : undefined,
    expandPaths: expandPaths.size > 0 ? [...expandPaths] : undefined,
  });

  const [selectedPath, setSelectedPath] = useState<string>(items[0]!.path);

  useEffect(() => {
    const uri = selectedPath.split("-").pop()!;
    if (props.onSelectNode) {
      props.onSelectNode(hierarchy.getItem(uri));
    }
  }, [selectedPath]);

  const expandPath = (path: string) => {
    setExpandPaths(prev => new Set([...prev, path]));
  };

  const unexpandPath = (path: string) => {
    setExpandPaths(prev => {
      const next = [...prev].filter(_path => {
        return !_path.startsWith(path);
      });

      if (selectedPath.startsWith(path) && selectedPath !== path) {
        setSelectedPath(path);
      }

      return new Set(next);
    });
  };

  const togglePathExpansion = (path: string) => {
    if (expandPaths.has(path)) {
      unexpandPath(path);
    } else {
      expandPath(path);
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={e => {
        const curIdx = items.findIndex(({ path }) => path === selectedPath);
        const curItem = items[curIdx];

        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (curIdx !== -1) {
            const nextIdx = curIdx + 1;
            const nextItem = items[nextIdx];
            if (nextItem) {
              setSelectedPath(nextItem.path);
            }
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (curIdx > 0) {
            const nextIdx = curIdx - 1;
            const nextItem = items[nextIdx];
            if (nextItem) {
              setSelectedPath(nextItem.path);
            }
          }
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          if (curItem) {
            expandPath(curItem.path);
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (curItem) {
            if (expandPaths.has(curItem.path)) {
              unexpandPath(curItem.path);
            } else {
              // Select previous level in hierarchy
              for (let i = curIdx; i >= 0; i--) {
                if (items[i]?.depth === curItem.depth - 1) {
                  setSelectedPath(items[i]!.path);
                  break;
                }
              }
            }
          }
        }
      }}
    >
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
          width={props.width || d.width}
        >
          <g transform={`translate(${d.paddingLeft}, ${d.paddingTop})`}>
            {items.map(({ item, depth, relToParent, path }, i) => (
              <g
                transform={`translate(${depth * d.tree.depthIndent}, ${i * d.tree.itemHeight})`}
                key={path}
              >
                {selectedPath !== path ? null : (
                  <text x={-28} stroke="red">
                    {SELECTION_MARKER}
                  </text>
                )}
                <text
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onMouseDown={e => {
                    if (e.detail === 1) {
                      // Single click: Select node
                      setSelectedPath(path);
                    } else if (e.detail === 2) {
                      // Double click: Expand hierarchy
                      togglePathExpansion(path);
                    }
                  }}
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
                  {hierarchy.graph.childrenByURI[item.uri]!.length ===
                  0 ? null : (
                    <rect
                      x={-14}
                      y={-d.tree.itemHeight / 2}
                      width={10}
                      height={10}
                      onClick={() => {
                        togglePathExpansion(path);
                      }}
                      fill={expandPaths.has(path) ? "#ccc" : "white"}
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
