import { h } from "preact";
import zfa, { ZFATerm } from "../zfa";

type HierarchyTermProps = {
  uri: string;
  onSelect?: (item: ZFATerm) => void;
};

export default function HierarchyTerm(props: HierarchyTermProps) {
  const item = zfa.itemsByURI[props.uri];

  return h("span", null, [
    h(
      "a",
      {
        href: "http://purl.obolibrary.org/obo/ZFA_" + item.uri.slice(4),
        onClick(e: MouseEvent) {
          if (!props.onSelect) return true;

          e.preventDefault();
          props.onSelect(item);
        },
      },
      item.label,
    ),
    ` (${item.zfin_usage} self) `,
  ]);
}
