from .dimension import dimension_def
from .measure import measure_def


table_def = {
    "type": "object",
    "properties": {
        "table": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "sql": {"type": "string"},
                    "sql_table": {"type": "string"},
                    "measures": measure_def,
                    "dimensions": dimension_def
                },
                "required": ["name", "sql", "measures", "dimensions"]
            }
        }
    },
    "required": ["table"]
}
