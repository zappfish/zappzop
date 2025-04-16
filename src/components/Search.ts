import { h } from "preact";
import lunr from "lunr";
import { useState, useEffect } from "preact/hooks";
import HierarchyItem from "./Term";
import zfa from "../zfa";

type SearchProps = {
  onItemSelect: (itemURI: string) => void;
};

function search(term: string, sortByUsage: boolean) {
  const results = zfa.index.search(term + "*");

  if (sortByUsage) {
    results.sort((a, b) => {
      return zfa.getItem(b.ref).zfin_usage - zfa.getItem(a.ref).zfin_usage;
    });
  }

  return results.slice(0, 100);
}

export default function Search(props: SearchProps) {
  const [searchResult, setSearchResult] = useState<lunr.Index.Result[]>([]);
  const [sortByUsage, setSortByUsage] = useState(true);

  useEffect(() => {
    setSearchResult(search("", sortByUsage));
  }, []);

  return h("div", null, [
    h(
      "div",
      null,
      h("input", {
        type: "text",
        onInput(e) {
          setSearchResult(search(e.currentTarget.value + "*", sortByUsage));
        },
      }),
    ),

    h(
      "ul",
      null,
      searchResult.map(result =>
        h(
          "li",
          {
            key: result.ref,
          },
          [
            h(HierarchyItem, {
              uri: result.ref,
              onSelect(item) {
                props.onItemSelect(item.uri);
              },
            }),
          ],
        ),
      ),
    ),
  ]);
}
