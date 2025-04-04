import { h, render } from "preact"
import { useState } from "preact/hooks"
import { Hierarchy, Search } from "./hierarchy"

function Main() {
  const [ itemURI, setItemURI ] = useState(window.location.hash.slice(1) || "ZFA:0100000")

  return h('div', null, [
    // h("h1", null, "Hierarchy browser"),
    h("div", null, [
      h("h2", null, itemURI),
      h("a", {
        "href": "https://ontobee.org/ontology/ZFA?iri=http://purl.obolibrary.org/obo/ZFA_" + itemURI.slice(4),
        "target": "_blank",
      }, [
        "Ontobee",
      ]),
      h("br", null),

      h("a", {
        "href": "https://www.ebi.ac.uk/ols4/ontologies/zp/classes/" + encodeURIComponent("http://purl.obolibrary.org/obo/ZFA_" + itemURI.slice(4)),
        "target": "_blank",
      }, [
        "OLS",
      ]),
    ]),
    h("hr", null),
    h(Hierarchy, { itemURI }),
    h("hr", null),
    h(Search, {
      onItemSelect: itemURI => {
        window.location.hash = itemURI
        setItemURI(itemURI)
      },
    })
  ])
}

const el = document.getElementById("application")!
render(h(Main, null), el)
