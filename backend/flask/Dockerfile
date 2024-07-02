FROM python:3.8-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y libpq-dev gcc

# Install Python packages
RUN pip install psycopg2-binary Flask PyYAML

# Copy the Python scripts to the Docker container
COPY app.py /usr/local/bin/app.py

# Copy the SQL script to the Docker container
COPY init.sql /docker-entrypoint-initdb.d/

# Expose the default PostgreSQL port and Flask port
EXPOSE 5500

# Run the Flask server
CMD ["flask", "run", "--host=0.0.0.0", "--port=5500"]




