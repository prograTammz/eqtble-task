from flask import Flask, request, jsonify
import yaml
import psycopg2
import os

app = Flask(__name__)


def parse_yaml(yaml_text):
    try:
        data = yaml.safe_load(yaml_text)
        table = data.get('table', [])[0]
        table_name = table.get('name')
        measures = table.get('measures', [])
        dimensions = table.get('dimensions', [])
        return table_name, measures, dimensions
    except yaml.YAMLError as e:
        return None, str(e), str(e)


def create_connection():
    """Create a database connection."""
    conn = None
    try:
        conn = psycopg2.connect(
            dbname=os.getenv("POSTGRES_DB"),
            user=os.getenv("POSTGRES_USER"),
            password=os.getenv("POSTGRES_PASSWORD"),
            host="db_flask",
            port="5432"
        )
    except psycopg2.OperationalError as e:
        print(f"Error connecting to database: {e}")
    return conn


@app.route('/parse', methods=['POST'])
def parse():
    yaml_text = request.data.decode('utf-8')
    table_name, measures, dimensions = parse_yaml(yaml_text)

    if table_name is None:
        return jsonify({'error': 'Invalid YAML format'}), 400

    return jsonify({
        'measures': [m['name'] for m in measures],
        'dimensions': [d['name'] for d in dimensions]
    })


@app.route('/query', methods=['POST'])
def query():
    content = request.json
    yaml_text = content.get('yaml')
    queries = content.get('queries')

    if not yaml_text or not queries:
        return jsonify({'error': 'Invalid request data'}), 400

    table_name, measures, dimensions = parse_yaml(yaml_text)

    if table_name is None:
        return jsonify({'error': 'Invalid YAML format'}), 400

    conn = create_connection()
    if conn is None:
        return jsonify({'error': 'Failed to connect to the database'}), 500

    measure_selects = []
    dimension_selects = []
    dimension_names = []

    for query in queries:
        query_type = query.get('type')
        query_name = query.get('name')

        if query_type == 'measure':
            measure = next(
                (m for m in measures if m['name'] == query_name), None)
            if measure:
                measure_type = measure['type']
                measure_sql = measure['sql']
                measure_selects.append(
                    f'{measure_type.upper()}({measure_sql}) AS {measure["name"]}')
        elif query_type == 'dimension':
            dimension = next(
                (d for d in dimensions if d['name'] == query_name), None)
            if dimension:
                dimension_selects.append(
                    f'{dimension["sql"]} AS {dimension["name"]}')
                dimension_names.append(dimension["name"])
        else:
            return jsonify({'error': 'Invalid query type'}), 400

    result = {"results": {}}

    # Query for measures
    if measure_selects:
        measure_sql_selects = ', '.join(measure_selects)
        measure_sql = f'SELECT {measure_sql_selects} FROM {table_name}'
        try:
            cur = conn.cursor()
            cur.execute(measure_sql)
            measure_results = cur.fetchone()
            cur.close()
            for idx, measure in enumerate(measure_selects):
                measure_name = measure.split(' AS ')[1]
                result["results"][measure_name] = measure_results[idx]
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # Query for dimensions
    if dimension_selects:
        dimension_sql_selects = ', '.join(dimension_selects)
        dimension_sql = f'SELECT {dimension_sql_selects} FROM {table_name}'
        try:
            cur = conn.cursor()
            cur.execute(dimension_sql)
            rows = cur.fetchall()
            cur.close()
            dimensions_list = []
            for row in rows:
                dimensions_dict = {
                    dimension_names[idx]: row[idx] for idx in range(len(dimension_names))}
                dimensions_list.append(dimensions_dict)
            result["results"]["dimensions"] = dimensions_list
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    conn.close()
    return jsonify(result)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5500)
