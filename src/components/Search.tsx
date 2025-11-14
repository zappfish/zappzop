import { useState, useEffect } from "react";
import { useSearchEngine, SearchResultWithNode } from "../search";
import { GraphNode } from "../graph";

type TermSearchProps<T extends GraphNode = GraphNode> = {
  nodes: Array<T>;
  onSelectNode?: (node: T) => void;
}

export default function TermSearch<T extends GraphNode = GraphNode>(
  props: TermSearchProps<T>,
){
  const [ results, setResults ] = useState<Array<SearchResultWithNode<T>> | null>(null)
  const [ searchText, setSearchText ] = useState("");
  const { engine } = useSearchEngine(props.nodes);

  useEffect(() => {
    const results = engine.search(searchText, {
      prefix: true,
      boost: { "label": 2 },
      combineWith: "and",
    })

    setResults(results.slice(0, 50))
  }, [ searchText ])

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
          <div key={result.id}>
            { result.node.label } - { result.score }
            {result.node.synonyms.map(syn => (
              <div>{ syn.value }</div>
            ))}
            {result.node.definitions.map(def => (
              <div>{ def.value }</div>
            ))}
            <hr />
          </div>
        ))}
      </div>
    </div>
  )
}
