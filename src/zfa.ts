import zfaData from "../hierarchy.json";
import Ontology, { OntologyTerm } from "./ontology";

export type ZFATerm = OntologyTerm & {
  synonyms: Array<string>;
  zfin_usage: number;
};

const zfa = new Ontology(zfaData.items as ZFATerm[]);
export default zfa;
