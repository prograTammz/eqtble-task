// src/config.js
import ace from "ace-builds/src-noconflict/ace";
import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/worker-yaml";

ace.config.setModuleUrl(
  "ace/mode/yaml_worker",
  require("ace-builds/src-noconflict/worker-yaml.js")
);
