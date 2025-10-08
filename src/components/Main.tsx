import { useState } from "react";
import Hierarchy from "./Hierarchy";
import Search from "./Search";

export default function Main() {
  const [itemURI, setItemURI] = useState(
    window.location.hash.slice(1) || "ZFA:0100000",
  );

  const ontobeeURI =
    "https://ontobee.org/ontology/ZFA?iri=http://purl.obolibrary.org/obo/ZFA_" +
    itemURI.slice(4);

  const olsURI =
    "https://www.ebi.ac.uk/ols4/ontologies/zp/classes/" +
    encodeURIComponent(
      "http://purl.obolibrary.org/obo/ZFA_" + itemURI.slice(4),
    );

  return (
    <div>
      <div>
        <h2>{itemURI}</h2>

        <a href={ontobeeURI} target="_blank">
          Ontobee
        </a>

        <br />

        <a href={olsURI} target="blank">
          OLS
        </a>
      </div>

      <hr />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <Search
          onItemSelect={itemURI => {
            window.location.hash = itemURI;
            setItemURI(itemURI);
          }}
        />
        <Hierarchy itemURI={itemURI} />
      </div>
    </div>
  );
}
