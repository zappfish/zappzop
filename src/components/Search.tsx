import { useState, useEffect } from "react";
import { useSearchEngine, SearchResultWithNode } from "../search";
import { GraphNode } from "../graph";
import Highlighter from "react-highlight-words";

type TermSearchProps<T extends GraphNode = GraphNode> = {
  nodes: Array<T>;
  onSelectNode?: (node: T) => void;
};

export default function TermSearch<T extends GraphNode = GraphNode>(
  props: TermSearchProps<T>,
) {
  const [results, setResults] = useState<Array<SearchResultWithNode<T>> | null>(
    null,
  );
  const [searchText, setSearchText] = useState("");
  const { engine } = useSearchEngine(props.nodes);

  useEffect(() => {
    const results = engine.search(searchText, {
      prefix: true,
      boost: { label: 2 },
      combineWith: "and",
    });

    setResults(results.slice(0, 50));
  }, [searchText]);

  const highlightStrings = searchText
    .split(" ")
    .map(word => new RegExp("\\b" + word));

  return (
    <div>
      <div>
        <input
          type="text"
          value={searchText}
          onChange={e => {
            setSearchText(e.target.value);
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
            <Highlighter
              textToHighlight={result.node.label || ""}
              searchWords={highlightStrings}
            />{" "}
            - {result.score}
            {result.node.synonyms.map(syn => (
              <div>
                <Highlighter
                  textToHighlight={syn.value}
                  searchWords={highlightStrings}
                />
              </div>
            ))}
            {result.node.definitions.map(def => (
              <div>
                <Highlighter
                  textToHighlight={def.value}
                  searchWords={highlightStrings}
                />
              </div>
            ))}
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
}
