# Eqtable Task

The project consist of 3 Parts all of them are dockerized and composed together with docker compose all you need to do is run the following command:

```bash
   docker-compose up --build
```

The three parts are:

- The Front-end which is a react app
- The Backend for API using Django
- The Backend for Dummy Employee Database for Parse & Query using Flask

The front-end Communicate with the Django API and Django API communicate with flask server for queries and parsing of yaml file, design wise there should be a Redis caching in middle of them.

# [FRONT-END] YAML Editor and Query Builder

## Overview

This project is a React application that allows users to create, edit, and manage YAML files. It includes features such as:

- A YAML editor with Ace Editor.
- Uploading YAML files.
- Parsing YAML files to extract dimensions and measures.
- Building queries using selected dimensions and measures.
- Displaying query results in a dialog.

## Features

1. **YAML File Management**

   - Create, edit, and delete YAML files.
   - Upload YAML files from the local system.
   - List all YAML files with details and actions.

2. **YAML Parsing and Query Building**

   - Parse YAML files to extract dimensions and measures.
   - Select dimensions and measures to build queries.
   - Execute queries and display results in a dialog.

3. **Editor Functionalities**
   - Use Ace Editor for editing YAML content.
   - Copy YAML content to clipboard.
   - View and compare versions using AceDiff.

## Getting Started

### Prerequisites

- Node.js and npm installed.
- Backend API running and accessible at `http://localhost:8000`.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/yaml-editor.git
   cd yaml-editor
   ```
