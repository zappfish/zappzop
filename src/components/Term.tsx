import zfa, { ZFATerm } from "../zfa";

type HierarchyTermProps = {
  uri: string;
  onSelect?: (item: ZFATerm) => void;
};

export default function HierarchyTerm(props: HierarchyTermProps) {
  const item = zfa.itemsByURI[props.uri];

  const handleClick = (e: MouseEvent) => {
    if (!props.onSelect) return true;
    e.preventDefault();
    props.onSelect(item);
  };

  const href = `http://purl.obolibrary.org/obo/ZFA_${item.uri.slice(4)}`;

  return (
    <span>
      <a href={href} onClick={handleClick}>
        {item.label}
      </a>
      {" "}
      ({item.zfin_usage} self)
    </span>
  );
}
