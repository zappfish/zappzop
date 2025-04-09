import { h } from "preact";
import lunr from "lunr";
import { useState } from "preact/hooks";
import HierarchyItem from "./Term";
import zfa from "../zfa";

type SearchProps = {
  onItemSelect: (itemURI: string) => void;
};

export default function Search(props: SearchProps) {
  const [searchResult, setSearchResult] = useState<lunr.Index.Result[]>([]);

  return h("div", null, [
    h(
      "div",
      null,
      h("input", {
        type: "text",
        onInput(e) {
          setSearchResult(
            zfa.index.search(e.currentTarget.value + "*").slice(0, 100),
          );
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
