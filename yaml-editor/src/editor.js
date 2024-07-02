// src/YamlEditor.js
import React, { useState } from "react";
import AceEditor from "react-ace";
import yaml from "js-yaml";
import { Grid, Paper, Typography } from "@mui/material";
import "./scripts/config-ace"; // Import the Ace editor configuration

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-github";

const YamlEditor = () => {
  const [yamlText, setYamlText] = useState("");
  const [jsonText, setJsonText] = useState("");

  const handleYamlChange = (newYaml) => {
    setYamlText(newYaml);
    try {
      const parsedYaml = yaml.load(newYaml);
      setJsonText(JSON.stringify(parsedYaml, null, 2));
    } catch (e) {
      setJsonText("Invalid YAML");
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        YAML Editor
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AceEditor
            mode="yaml"
            theme="github"
            onChange={handleYamlChange}
            value={yamlText}
            name="YAML_EDITOR"
            editorProps={{ $blockScrolling: true }}
            height="500px"
            width="100%"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              padding: 2,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              overflow: "auto",
            }}
          >
            <Typography variant="h6" gutterBottom>
              JSON Output
            </Typography>
            <pre>{jsonText}</pre>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default YamlEditor;
