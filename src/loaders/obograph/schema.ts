import * as z from "zod";

export const OBOMeta = z.object({
  definition: z.optional(
    z.object({
      val: z.string(),
      pred: z.optional(z.string()),
      xrefs: z.optional(z.array(z.string())),
      get meta() {
        return z.optional(OBOMeta);
      },
    }),
  ),
  comments: z.optional(z.array(z.string())),
  subsets: z.optional(z.array(z.string())),
  synonyms: z.optional(
    z.array(
      z.object({
        synonymType: z.optional(z.string()),
        pred: z.optional(z.string()),
        val: z.string(),
        xrefs: z.optional(z.array(z.string())),
        get meta() {
          return z.optional(OBOMeta);
        },
      }),
    ),
  ),
  xrefs: z.optional(
    z.array(
      z.object({
        lbl: z.optional(z.string()),
        pred: z.optional(z.string()),
        val: z.string(),
        xrefs: z.optional(z.array(z.string())),
        get meta() {
          return z.optional(OBOMeta);
        },
      }),
    ),
  ),
  basicPropertyValues: z.optional(
    z.array(
      z.object({
        pred: z.string(),
        val: z.string(),
        xrefs: z.optional(z.array(z.string())),
        get meta() {
          return z.optional(OBOMeta);
        },
      }),
    ),
  ),
  version: z.optional(z.string()),
  deprecatd: z.optional(z.boolean()),
});

export const OBOGraph = z.object({
  id: z.string(),
  lbl: z.optional(z.string()),
  meta: z.optional(OBOMeta),
  nodes: z.array(
    z.object({
      id: z.string(),
      lbl: z.optional(z.string()),
      type: z.literal(["CLASS", "INDIVIDUAL", "PROPERTY"]),
      propertyType: z.optional(z.literal(["ANNOTATION", "OBJECT", "DATA"])),
      meta: z.optional(OBOMeta),
    }),
  ),
  edges: z.array(
    z.object({
      sub: z.string(),
      pred: z.string(),
      obj: z.string(),
      meta: z.optional(OBOMeta),
    }),
  ),
  // logicalDefinitionAxioms,
  // domainRangeAxioms,
  // propertyChainAxioms,
});

export const OBOGraphsSchema = z.object({
  meta: z.optional(OBOMeta),
  graphs: z.array(OBOGraph),
});

export type OBOGraphs = z.infer<typeof OBOGraphsSchema>;

export type OBOGraph = z.infer<typeof OBOGraph>;
