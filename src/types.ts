export type GraphNode = {
  uri: string;
  label: string | null;
  synonyms: Array<{
    value: string;
  }>;
  definitions: Array<{
    value: string;
  }>;
  children: Record<string, Array<string>>;
  parents: Record<string, Array<string>>;
};
