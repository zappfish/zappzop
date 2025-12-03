import { useNodeSearch } from "../search";
import { GraphNode } from "../types";

type TermSearchProps<T extends GraphNode = GraphNode> = {
  nodes: Array<T>;
  onSelectNode?: (node: T) => void;
};

export default function TermSearch<T extends GraphNode = GraphNode>(
  props: TermSearchProps<T>,
) {
  const { query, setQuery, results, highlightText } = useNodeSearch(
    props.nodes,
  );

  return (
    <div>
      <div>
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
          }}
        />
      </div>

      <div>
        {(results || []).map(result => (
          <div
            key={result.id}
            style={{
              cursor: "pointer",
            }}
            onClick={() => {
              if (props.onSelectNode) {
                props.onSelectNode(result.node);
              }
            }}
          >
            {highlightText(result.node.label || "")} - {result.score}
            {result.node.synonyms.map(syn => (
              <div>{highlightText(syn.value || "")}</div>
            ))}
            {result.node.definitions.map(def => (
              <div>{highlightText(def.value || "")}</div>
            ))}
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}
