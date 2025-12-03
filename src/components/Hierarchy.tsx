import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import Hierarchy, { HierarchyRow } from "../hierarchy";
import Path from "../path";
import { GraphNode } from "../types";
import { takeWhile } from "../util";

type HierarchyTreeProps<T extends GraphNode = GraphNode> = {
  hierarchy: Hierarchy<T>;
  rootURI: string;
  itemURI?: string;
  preferredPaths?: Array<string>;
  width?: number;
  onSelectNode?: (node: T) => void;
};

export type HierarchyTreeHandle = {
  openAndFocusNode: (uri: string) => void;
};

type HierarchyTreeState = {
  expandPaths: Set<string>;
  showPaths: Set<string>;
  selectedPath: Path;
};

const d = {
  // width: 1000,
  tree: {
    itemHeight: 24,
    depthIndent: 16,
  },
};

// const SELECTION_MARKER = ">";

function drawHierarchyPath(
  tree: Array<HierarchyRow<GraphNode>>,
  el: HTMLCanvasElement,
) {
  const ctx = el.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;

  const cssHeight = tree.length * d.tree.itemHeight;

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

  tree.forEach((originItem, i) => {
    const childItems = takeWhile(
      tree.slice(i + 1),
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

/*
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
*/

function HierarchyTree<T extends GraphNode = GraphNode>(
  props: HierarchyTreeProps<T>,
  ref: React.Ref<HierarchyTreeHandle>,
) {
  const { hierarchy, itemURI } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [treeState, setTreeState] = useState<HierarchyTreeState>({
    expandPaths: new Set(),
    showPaths: new Set(),
    selectedPath: hierarchy.getPathsForNode(props.rootURI)[0]!,
  });

  /*
  const [showRelations, setShowRelations] = useState(false);
   */

  useEffect(() => {
    const expandPaths: Set<string> = new Set();

    let showPaths: Set<string> | null = null;

    if (itemURI) {
      const node = hierarchy.getNode(itemURI);
      const paths = hierarchy.getPathsForNode(node);
      showPaths = new Set(paths.map(path => path.key));
    }

    setTreeState(prev => ({
      ...prev,
      expandPaths,
      showPaths: showPaths ? showPaths : prev.showPaths,
    }));
  }, [itemURI]);

  const tree = hierarchy.projectFlatView({
    showPaths: [...treeState.showPaths].map(key => Path.fromKey(key)),
    expandPaths: [...treeState.expandPaths].map(key => Path.fromKey(key)),
  });

  /*
  const tree = hierarchy.buildFlatTree(item, {
    preferredPaths: usePreferredPaths ? preferredPaths : undefined,
    expandPaths: expandPaths.size > 0 ? [...expandPaths] : undefined,
  });
   */

  useImperativeHandle(
    ref,
    () => ({
      openAndFocusNode(uri: string) {
        const node = hierarchy.getNode(uri);
        const paths = hierarchy.getPathsForNode(node);
        const parents = paths.map(p => p.parent()).filter(p => p !== null);

        setTreeState(prev => {
          const expandPaths = new Set([...prev.expandPaths, ...parents.map(p => p.key)]);
          const showPaths = new Set([...paths.map(path => path.key)]);
          const selectedPath = paths[0]!;

          console.log(selectedPath)

          return {
            expandPaths,
            showPaths,
            selectedPath,
          }
        })
      },
    }),
    [],
  );

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    drawHierarchyPath(tree, canvasEl);
  }, [tree]);

  useEffect(() => {
    const uri = treeState.selectedPath.leaf();
    if (props.onSelectNode) {
      props.onSelectNode(hierarchy.getNode(uri));
    }
  }, [treeState.selectedPath]);

  const expandPath = (pathKey: string) => {
    setTreeState(prev => ({
      ...prev,
      expandPaths: new Set([...prev.expandPaths, pathKey]),
    }))
  };

  const unexpandPath = (pathKey: string) => {
    const path = Path.fromKey(pathKey);

    setTreeState(prev => {
      const nextExpandPaths = [...prev.expandPaths].filter(_path => {
        return !Path.fromKey(_path).startsWith(path);
      });

      const nextShowPaths = [...prev.showPaths].filter(_path => {
        return !Path.fromKey(_path).startsWith(path);
      });

      let nextSelectedPath = treeState.selectedPath;

      if (treeState.selectedPath.startsWith(path) && !treeState.selectedPath.equals(path)) {
        nextSelectedPath = path;
      }

      return {
        selectedPath: nextSelectedPath,
        showPaths: new Set(nextShowPaths),
        expandPaths: new Set(nextExpandPaths),
      }
    })
  };

  const togglePathExpansion = (path: string) => {
    if (treeState.expandPaths.has(path)) {
      unexpandPath(path);
    } else {
      expandPath(path);
    }
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={e => {
        const curIdx = tree.findIndex(({ path }) => path.equals(treeState.selectedPath));
        const curItem = tree[curIdx];

        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (curIdx !== -1) {
            const nextIdx = curIdx + 1;
            const nextItem = tree[nextIdx];
            if (nextItem) {
              setTreeState(prev => ({
                ...prev,
                selectedPath: nextItem.path,
              }))
            }
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          if (curIdx > 0) {
            const nextIdx = curIdx - 1;
            const nextItem = tree[nextIdx];
            if (nextItem) {
              setTreeState(prev => ({
                ...prev,
                selectedPath: nextItem.path,
              }))
            }
          }
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          if (curItem) {
            expandPath(curItem.path.key);
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          if (curItem) {
            if (treeState.expandPaths.has(curItem.path.key)) {
              unexpandPath(curItem.path.key);
            } else {
              // Select previous level in hierarchy
              for (let i = curIdx; i >= 0; i--) {
                if (tree[i]?.depth === curItem.depth - 1) {
                  setTreeState(prev => ({
                    ...prev,
                    selectedPath: tree[i]!.path,
                  }))
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
          {tree.map(({ item, depth, path }) => (
            <div
              key={path.key}
              data-path={path.key}
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
                onClick={() => togglePathExpansion(path.key)}
                style={{
                  display: "inline-block",
                  width: "18px",
                }}
              >
                {hierarchy.graph.childrenByURI[item.uri]!.length ===
                0 ? null : (
                  <span
                    style={{
                      display: "inline-flex",
                      width: 10,
                      height: 10,
                      border: "2px solid #666",
                      background: treeState.expandPaths.has(path.key) ? "#ccc" : "#fff",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {treeState.expandPaths.has(path.key) ? "" : ""}
                  </span>
                )}
              </span>
              <span
                style={{
                  flex: 1,

                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",

                  backgroundColor: treeState.selectedPath.equals(path)
                    ? "#f0f0f0"
                    : "transparent",
                }}
                title={itemURI}
                onMouseDown={e => {
                  if (e.detail === 1) {
                    // Single click: Select node
                    setTreeState(prev => ({
                      ...prev,
                      selectedPath: path,
                    }))
                  } else if (e.detail === 2) {
                    // Double click: Expand hierarchy
                    togglePathExpansion(path.key);
                  }
                }}
              >
                {/* showRelations ? relToParent + " " : "" */}
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.forwardRef(HierarchyTree);
