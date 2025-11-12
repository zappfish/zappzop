import MiniSearch from "minisearch";
import { GraphNode } from "./graph";

export default class Search<T extends GraphNode> {
  items: Array<T>;
  miniSearch: MiniSearch;

  constructor(items: Array<T>) {
    this.items = items;
    this.miniSearch = new MiniSearch({
      idField: "uri",
      fields: ["label", "synonyms", "definitions"],
      extractField: (doc, fieldName) => {
        if (fieldName === "synonyms" || fieldName === "definitions") {
          return doc[fieldName].map(x => x.value).join(" ")
        }

        return doc[fieldName]
      },
    })
  }

  buildIndex() {
    this.miniSearch.addAll(this.items)
  }
}
