import { useState, useEffect, useRef } from "react";
import { Hierarchy, GraphNode } from "../graph";
import { takeWhile } from "../util";

type HierarchyTreeProps<T extends GraphNode = GraphNode> = {
  hierarchy: Hierarchy<T>;
  rootURI: string;
  itemURI: string;
  preferredPaths?: Array<string>;
  width?: number;
  onSelectNode?: (node: T) => void;
};

const d = {
  // width: 1000,
  tree: {
    itemHeight: 24,
    depthIndent: 16,
  },
};

const SELECTION_MARKER = ">";

function drawHierarchyPath(
  items: ReturnType<typeof Hierarchy.prototype.buildFlatTree>,
  el: HTMLCanvasElement,
) {
  const ctx = el.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;

  const cssHeight =
    items.length * d.tree.itemHeight

  el.style.width = "100%";
  el.style.height = `${cssHeight}px`;

  const cssWidth = el.clientWidth;

  el.width = cssWidth * dpr;
  el.height = cssHeight * dpr;

  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.setLineDash([1, 1]);
  ctx.beginPath();

  items.forEach((originItem, i) => {
    const childItems = takeWhile(
      items.slice(i + 1),
      item => item.depth > originItem.depth,
    );

    if (childItems.length === 0) return;

    const x0 = originItem.depth * d.tree.depthIndent + 5;
    const y0 = i * d.tree.itemHeight + d.tree.itemHeight / 2;

    const lastDirectChildIdx =
      childItems.findLastIndex(item => item.depth === originItem.depth + 1) + 1;
    // Draw a line down to the last direct child
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0, y0 + lastDirectChildIdx * d.tree.itemHeight);

    childItems.forEach((childItem, i) => {
      if (childItem.depth === originItem.depth + 1) {
        // Draw a tick
        const tickWidth = d.tree.depthIndent;
        const y = y0 + (i + 1) * d.tree.itemHeight;
        ctx.moveTo(x0, y);
        ctx.lineTo(x0 + tickWidth, y);
      }
    });
  });
  ctx.stroke();
}

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

export default function HierarchyTree<T extends GraphNode = GraphNode>(
  props: HierarchyTreeProps<T>,
) {
  const { hierarchy, preferredPaths, itemURI } = props;
  const [usePreferredPaths, setUsePreferredPaths] = useState(false);
  const [expandPaths, setExpandPaths] = useState<Set<string>>(new Set());
  const [showRelations, setShowRelations] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setExpandPaths(new Set());
  }, [itemURI]);

  const root = hierarchy.root;
  const item = hierarchy.getItem(itemURI);
  const items = hierarchy.buildFlatTree(item, {
    preferredPaths: usePreferredPaths ? preferredPaths : undefined,
    expandPaths: expandPaths.size > 0 ? [...expandPaths] : undefined,
  });

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    drawHierarchyPath(items, canvasEl);
  }, [items]);

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
      <div
        style={{
          position: "relative",
          border: "1px solid #ccc",
          width: props.width,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        <div style={{ position: "relative" }}>
          {items.map(({ item, depth, relToParent, path }) => (
            <div
              key={path}
              style={{
                display: "flex",
                alignItems: "center",

                lineHeight: `${d.tree.itemHeight}px`,
                height: `${d.tree.itemHeight}px`,

                paddingLeft: `${depth * d.tree.depthIndent}px`,

                userSelect: "none",
                cursor: "pointer",
              }}
            >
              <span
                onClick={() => togglePathExpansion(path)}
                style={{
                  display: "inline-block",
                  width: "18px",
                }}
              >
                {hierarchy.graph.childrenByURI[item.uri]!.length === 0 ? null : (
                  <span
                    style={{
                      display: "inline-flex",
                      width: 10,
                      height: 10,
                      border: "2px solid #666",
                      background: expandPaths.has(path) ? "#ccc" : "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {expandPaths.has(path) ? "" : ""}
                  </span>
                )}
              </span>
              <span
                style={{
                  flex: 1,

                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",

                  backgroundColor:
                    selectedPath === path ? "#f0f0f0" : "transparent",
                }}
                title={itemURI}
                onMouseDown={e => {
                  if (e.detail === 1) {
                    // Single click: Select node
                    setSelectedPath(path);
                  } else if (e.detail === 2) {
                    // Double click: Expand hierarchy
                    togglePathExpansion(path);
                  }
                }}
              >
                {showRelations ? relToParent + " " : ""}
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
