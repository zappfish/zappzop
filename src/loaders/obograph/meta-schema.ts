// This is pulled from the obographs git repository, with a couple small changes
// to get things working with `json-schema-to-ts`:
//
// 1. The circular reference to `meta` is removed. This may make this schema
//    incompatible with some graphs. If that becomes an issue, the type for the
//    graph will need to be created manually, not automatically from the JSON
//    schema definition.
//
// 2. The top level `id` property is changed to `$id`.
//
// 3. Several properties are marked as required.
//
// <https://github.com/geneontology/obographs/blob/6676b10a5cce04707d75b9dd46fa08de70322b0b/schema/subschemas/obographs-meta-schema.json>

export default {
  type: "object",
  $id: "urn:jsonschema:org:geneontology:obographs:core:model:Meta",
  properties: {
    definition: {
      type: "object",
      id: "urn:jsonschema:org:geneontology:obographs:core:model:meta:DefinitionPropertyValue",
      required: ["pred", "val"],
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
        required: ["pred", "val"],
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
        required: ["pred", "val"],
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
        required: ["pred", "val"],
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
} as const;
