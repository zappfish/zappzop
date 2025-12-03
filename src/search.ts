import { useEffect, useRef, useState, createElement } from "react";
import MiniSearch, { SearchOptions, SearchResult } from "minisearch";
import { GraphNode } from "./types";
import Highlighter, { HighlighterProps } from "react-highlight-words";

export type SearchResultWithNode<T extends GraphNode> = SearchResult & {
  node: T;
};

export class SearchEngine<T extends GraphNode> {
  items: Array<T>;
  itemsByURI: Map<string, T>;
  miniSearch: MiniSearch;

  constructor(items: Array<T>) {
    this.items = items;

    this.itemsByURI = new Map(items.map(item => [item.uri, item]));

    this.miniSearch = new MiniSearch({
      idField: "uri",
      fields: ["label", "synonyms", "definitions"],
      extractField: (doc, fieldName) => {
        if (fieldName === "synonyms" || fieldName === "definitions") {
          // @ts-expect-error Don't worry about cajoling this into types.
          return doc[fieldName].map(x => x.value).join(" ");
        }

        return doc[fieldName];
      },
    });
  }

  search(
    text: string,
    options?: SearchOptions,
  ): Array<SearchResultWithNode<T>> {
    const results = this.miniSearch.search(text, options);

    return results.map(res => ({
      ...res,
      node: this.itemsByURI.get(res.id)!,
    }));
  }

  buildIndex() {
    this.miniSearch.addAll(this.items);
  }
}

export function useSearchEngine<T extends GraphNode>(items: Array<T>) {
  const engineRef = useRef<SearchEngine<T>>(null);

  const rebuild = (items: Array<T>) => {
    const engine = new SearchEngine(items);
    engine.buildIndex();
    engineRef.current = engine;
  };

  if (engineRef.current === null) {
    rebuild(items);
  }

  useEffect(() => {
    rebuild(items);
  }, [items]);

  return { engine: engineRef.current! };
}

export function useNodeSearch<T extends GraphNode>(nodes: Array<T>) {
  const { engine } = useSearchEngine(nodes);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<SearchResultWithNode<T>> | null>(
    null,
  );

  useEffect(() => {
    if (query.trim() === "") {
      setResults(null);
      return;
    }

    const results = engine.search(query, {
      prefix: true,
      boost: { label: 2 },
      combineWith: "and",
    });

    setResults(results);
  }, [query]);

  const searchWords = query.split(" ").map(word => new RegExp("\\b" + word));

  const highlightText = (
    text: string,
    props?: Omit<HighlighterProps, "searchWords" | "textToHighlight">,
  ) =>
    createElement(Highlighter, {
      textToHighlight: text,
      searchWords,
      ...props,
    });

  return { engine, results, query, setQuery, highlightText };
}
