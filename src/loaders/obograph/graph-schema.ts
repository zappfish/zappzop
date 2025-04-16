// This is pulled from the obographs git repository, with a couple small changes
// to get things working with `json-schema-to-ts`. See the comment in `meta-schema.ts`.
//
// <https://github.com/geneontology/obographs/blob/6676b10a5cce04707d75b9dd46fa08de70322b0b/schema/subschemas/obographs-graph-schema.json>

export default {
  type: "object",
  id: "urn:jsonschema:org:geneontology:obographs:core:model:Graph",
  required: ["id", "nodes", "edges"],
  properties: {
    id: {
      type: "string",
    },
    lbl: {
      type: "string",
    },
    meta: {
      type: "object",
      $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
    },
    nodes: {
      type: "array",
      items: {
        type: "object",
        id: "urn:jsonschema:org:geneontology:obographs:core:model:Node",
        required: ["id", "lbl", "type", "propertyType"],
        properties: {
          id: {
            type: "string",
          },
          lbl: {
            type: "string",
          },
          type: {
            type: "string",
            enum: ["CLASS", "INDIVIDUAL", "PROPERTY"],
          },
          propertyType: {
            type: "string",
            enum: ["ANNOTATION", "OBJECT", "DATA"],
          },
          meta: {
            type: "object",
            $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
          },
        },
      },
    },
    edges: {
      type: "array",
      items: {
        type: "object",
        id: "urn:jsonschema:org:geneontology:obographs:core:model:Edge",
        required: ["sub", "pred", "obj"],
        properties: {
          sub: {
            type: "string",
          },
          pred: {
            type: "string",
          },
          obj: {
            type: "string",
          },
          meta: {
            type: "object",
            $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
          },
        },
      },
    },
    equivalentNodesSets: {
      type: "array",
      items: {
        type: "object",
        id: "urn:jsonschema:org:geneontology:obographs:core:model:axiom:EquivalentNodesSet",
        properties: {
          representativeNodeId: {
            type: "string",
          },
          nodeIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
          meta: {
            type: "object",
            $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
          },
        },
      },
    },
    logicalDefinitionAxioms: {
      type: "array",
      items: {
        type: "object",
        id: "urn:jsonschema:org:geneontology:obographs:core:model:axiom:LogicalDefinitionAxiom",
        properties: {
          definedClassId: {
            type: "string",
          },
          genusIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
          restrictions: {
            type: "array",
            items: {
              type: "object",
              id: "urn:jsonschema:org:geneontology:obographs:core:model:axiom:ExistentialRestrictionExpression",
              properties: {
                propertyId: {
                  type: "string",
                },
                fillerId: {
                  type: "string",
                },
              },
            },
          },
          meta: {
            type: "object",
            $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
          },
        },
      },
    },
    domainRangeAxioms: {
      type: "array",
      items: {
        type: "object",
        id: "urn:jsonschema:org:geneontology:obographs:core:model:axiom:DomainRangeAxiom",
        properties: {
          predicateId: {
            type: "string",
          },
          domainClassIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
          rangeClassIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
          allValuesFromEdges: {
            type: "array",
            items: {
              type: "object",
              $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Edge",
            },
          },
          meta: {
            type: "object",
            $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
          },
        },
      },
    },
    propertyChainAxioms: {
      type: "array",
      items: {
        type: "object",
        id: "urn:jsonschema:org:geneontology:obographs:core:model:axiom:PropertyChainAxiom",
        properties: {
          predicateId: {
            type: "string",
          },
          chainPredicateIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
          meta: {
            type: "object",
            $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
          },
        },
      },
    },
  },
} as const;
