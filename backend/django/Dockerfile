# Use the official Python image from the Docker Hub
FROM python:3.9-alpine3.13
LABEL maintainer="progratammz420"

ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies and PostgreSQL client
RUN apk add --update --no-cache \
    postgresql-client \
    && apk add --update --no-cache --virtual .tmp-build-deps \
    build-base \
    postgresql-dev \
    musl-dev \
    linux-headers

# Create virtual environment and install Python dependencies
COPY ./requirements.txt /tmp/requirements.txt
RUN python -m venv /py \
    && /py/bin/pip install --upgrade pip \
    && /py/bin/pip install -r /tmp/requirements.txt \
    && rm -rf /tmp

# Remove build dependencies
RUN apk del .tmp-build-deps

# Copy project
COPY ./scripts /scripts
COPY ./app /app

# Create a user and give permissions
RUN adduser --disabled-password --no-create-home django-user \
    && chown -R django-user:django-user /app \
    && chmod -R +x /scripts

# Set environment PATH
ENV PATH="/scripts:/py/bin:$PATH"

# Switch to the new user
USER django-user

# Expose port 8000 and specify the default command
EXPOSE 8000
CMD ["run.sh"]
