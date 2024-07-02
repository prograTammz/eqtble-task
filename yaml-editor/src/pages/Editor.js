// src/YAMLEditorPage.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../ApiContext";
import "./Editor.css";
import {
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
} from "@mui/material";

import {
  CloudUpload as CloudUploadIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";

import axios from "axios";

import ace from "ace-builds/src-noconflict/ace";
import { diff as DiffEditor } from "react-ace";

import "ace-builds/src-noconflict/mode-yaml";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/worker-yaml";
import YAMLUploadDialog from "./UploadDialog";
import YAMLQueryBuilder from "./QueryBuilder";

ace.config.setModuleUrl(
  "ace/mode/yaml_worker",
  require("ace-builds/src-noconflict/worker-yaml.js")
);

const YAMLEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [yamlText, setYamlText] = useState("");
  const [fileName, setFileName] = useState("");
  const [history, setHistory] = useState([]);
  const [selectedVersionContent, setSelectedVersionContent] = useState("");
  const [error, setError] = useState(false); // State for error handling
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
  const [openDialog, setOpenDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false); // State for copy success

  useEffect(() => {
    if (id !== "new") {
      const fetchFileData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/yaml-files/${id}/`
          );
          setYamlText(response.data.content);
          setFileName(response.data.name);
          setHistory(response.data.history);
        } catch (error) {
          console.error("Error fetching the YAML file:", error);
        }
      };
      fetchFileData();
    }
  }, [id]);

  const handleEditorChange = (editorTextArr) => {
    setYamlText(editorTextArr[0]);
    setSelectedVersionContent(editorTextArr[1]);
  };

  const handleSave = async () => {
    try {
      if (id === "new") {
        // Implement create file logic here if needed
        await axios.post(`http://localhost:8000/api/yaml-files/`, yamlText, {
          headers: {
            "Content-Type": "text/plain",
          },
        });
        navigate("/");
      } else {
        await axios.put(
          `http://localhost:8000/api/yaml-files/${id}/`,
          yamlText,
          {
            headers: {
              "Content-Type": "text/plain",
            },
          }
        );
        navigate("/");
      }
    } catch (error) {
      setError(true); // Show error Snackbar
      setErrorMessage(
        error.response?.data?.error || "Error saving the YAML file"
      );
    }
  };

  const handleVersionClick = async (versionId) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/yaml-files/${id}/version/${versionId}`
      );
      console.log(response.data);
      const yamlString = response.data.replace(/\\n/g, "\n");
      setSelectedVersionContent(yamlString);
    } catch (error) {
      console.error("Error fetching the YAML version:", error);
    }
  };

  const handleUploadClick = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const navigateHome = () => {
    navigate("/");
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(yamlText)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000); // Hide success message after 3 seconds
      })
      .catch(() => {
        setError(true);
        setErrorMessage("Failed to copy text to clipboard");
      });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {id === "new" ? "New YAML File" : `Edit YAML File: ${fileName}`}
      </Typography>
      {id === "new" && (
        <Button
          variant="contained"
          color="secondary"
          startIcon={<CloudUploadIcon />}
          onClick={handleUploadClick}
          style={{ marginBottom: 16 }}
        >
          Upload YAML File
        </Button>
      )}
      <DiffEditor
        mode="yaml"
        theme="github"
        onChange={handleEditorChange}
        value={[yamlText, selectedVersionContent]}
        name="YAML_EDITOR"
        editorProps={{ $blockScrolling: true }}
        height="400px"
        width="100%"
      />
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save
      </Button>
      <Button
        variant="contained"
        onClick={() => navigate("/")}
        style={{ marginLeft: 8 }}
      >
        Cancel
      </Button>
      <Tooltip title="Copy to Clipboard">
        <IconButton color="primary" onClick={handleCopy}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
      <Typography variant="h6" gutterBottom style={{ marginTop: 16 }}>
        Change History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Version ID</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>Is Latest</TableCell>
              <TableCell>Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((entry, index) => (
              <TableRow
                key={index}
                hover
                onClick={() => handleVersionClick(entry.VersionId)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>{entry.VersionId}</TableCell>
                <TableCell>
                  {new Date(entry.LastModified).toLocaleString()}
                </TableCell>
                <TableCell>{entry.IsLatest ? "Yes" : "No"}</TableCell>
                <TableCell>{entry.Size}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <YAMLQueryBuilder fileId={id} />
      <YAMLUploadDialog
        open={openDialog}
        handleClose={handleClose}
        action={navigateHome}
      />
      <Snackbar
        open={error}
        autoHideDuration={30000}
        onClose={() => setError(false)}
      >
        <Alert onClose={() => setError(false)} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success">
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default YAMLEditorPage;
