measure_def = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "name": {"type": "string"},
            "sql": {"type": "string"},
            "type": {"type": "string", "enum": ["count", "sum", "avg", "min", "max", "number"]},
            "title": {"type": "string"},
            "description": {"type": "string"},
            "filters": {
                "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "sql": {"type": "string"}
                            },
                            "required": ["sql"]
                        }
            }
        },
        "required": ["name", "sql", "type"]
    }
}
