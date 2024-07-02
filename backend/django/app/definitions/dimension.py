dimension_def = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "sql": {"type": "string"},
            "type": {"type": "string", "enum": ["string", "number", "time", "boolean", "geo"]},
            "format": {"type": "string", "enum": ["id", "imageUrl", "link", "currency", "percent"]},
            "primaryKey": {"type": "boolean"},
            "sub_query": {"type": "boolean"},
            "title": {"type": "string"},
            "description": {"type": "string"},
            "case": {
                "type": "object",
                "properties": {
                    "when": {
                        "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                            "sql": {"type": "string"},
                                            "label": {"type": "string"}
                                    },
                                    "required": ["sql", "label"]
                                }
                    },
                    "else": {
                        "type": "object",
                                "properties": {
                                    "label": {"type": "string"}
                                },
                        "required": ["label"]
                    }
                },
                "required": ["when", "else"]
            },

        },
        "required": ["name", "sql", "type"]
    }
}
