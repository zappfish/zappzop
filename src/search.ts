import { useEffect, useRef } from "react";
import MiniSearch, { SearchOptions, SearchResult } from "minisearch";
import { GraphNode } from "./graph";

export type SearchResultWithNode<T extends GraphNode> = SearchResult & {
  node: T;
}

export default class SearchEngine<T extends GraphNode> {
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
          return doc[fieldName].map(x => x.value).join(" ");
        }

        return doc[fieldName];
      },
    });
  }

  search(text: string, options?: SearchOptions): Array<SearchResultWithNode<T>> {
    const results = this.miniSearch.search(text, options)

    return results.map(res => ({
      ...res,
      node: this.itemsByURI.get(res.id)!,
    }))
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
  }

  if (engineRef.current === null) {
    rebuild(items)
  }

  useEffect(() => {
    rebuild(items)
  }, [items]);

  return { engine: engineRef.current! };
}
