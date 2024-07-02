import yaml
import jsonschema
from .table import table_def


def validate_table(yaml_content, schema):
    """
    Validate a YAML content against a schema.
    """
    try:
        jsonschema.validate(instance=yaml_content, schema=schema)
        print("YAML content is valid.")
    except jsonschema.exceptions.ValidationError as err:
        print(f"YAML content is invalid: {err.message}")


def load_yaml_table(file_path,  schema):
    """
    Load a YAML file and validate it.
    """
    with open(file_path, 'r') as file:
        try:
            yaml_content = yaml.safe_load(file)
            validate_table(yaml_content, schema)
        except yaml.YAMLError as err:
            print(f"Error parsing YAML file: {err}")


file_path = './schemas/salary.yaml'
load_yaml_table(file_path, table_def)
