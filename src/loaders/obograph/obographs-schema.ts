// Do not edit.

export default {
  type: "object",
  id: "urn:jsonschema:org:geneontology:obographs:core:model:GraphDocument",
  properties: {
    meta: {
      type: "object",
      $id: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
      properties: {
        definition: {
          type: "object",
          $id: "urn:jsonschema:org:geneontology:obographs:core:model:meta:DefinitionPropertyValue",
          properties: {
            pred: {
              type: "string",
            },
            val: {
              type: "string",
            },
            xrefs: {
              type: "array",
              items: {
                type: "string",
              },
            },
            /*
            meta: {
              type: "object",
              $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
            },
            */
          },
        },
        comments: {
          type: "array",
          items: {
            type: "string",
          },
        },
        subsets: {
          type: "array",
          items: {
            type: "string",
          },
        },
        synonyms: {
          type: "array",
          items: {
            type: "object",
            id: "urn:jsonschema:org:geneontology:obographs:core:model:meta:SynonymPropertyValue",
            properties: {
              synonymType: {
                type: "string",
              },
              pred: {
                type: "string",
              },
              val: {
                type: "string",
              },
              xrefs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              /*
              meta: {
                type: "object",
                $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
              },
              */
            },
          },
        },
        xrefs: {
          type: "array",
          items: {
            type: "object",
            id: "urn:jsonschema:org:geneontology:obographs:core:model:meta:XrefPropertyValue",
            properties: {
              lbl: {
                type: "string",
              },
              pred: {
                type: "string",
              },
              val: {
                type: "string",
              },
              xrefs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              /*
              meta: {
                type: "object",
                $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
              },
              */
            },
          },
        },
        basicPropertyValues: {
          type: "array",
          items: {
            type: "object",
            id: "urn:jsonschema:org:geneontology:obographs:core:model:meta:BasicPropertyValue",
            properties: {
              pred: {
                type: "string",
              },
              val: {
                type: "string",
              },
              xrefs: {
                type: "array",
                items: {
                  type: "string",
                },
              },
              /*
              meta: {
                type: "object",
                $ref: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
              },
              */
            },
          },
        },
        version: {
          type: "string",
        },
        deprecated: {
          type: "boolean",
        },
      },
    },
    graphs: {
      type: "array",
      items: {
        type: "object",
        id: "urn:jsonschema:org:geneontology:obographs:core:model:Graph",
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
      },
    },
  },
} as const;
