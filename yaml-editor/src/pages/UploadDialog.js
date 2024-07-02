import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

const YAMLUploadDialog = ({ open, handleClose, action }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        "http://localhost:8000/api/yaml-files/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      // Refresh the file list after upload
      action();

      handleClose();
    } catch (error) {
      console.error("Error uploading the file:", error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Upload YAML File</DialogTitle>
      <DialogContent>
        <DialogContentText>
          To upload a YAML file, please select a file from your computer.
        </DialogContentText>
        <input
          accept=".yaml,.yml"
          style={{ display: "none" }}
          id="upload-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="upload-file">
          <Button variant="contained" color="primary" component="span">
            Choose File
          </Button>
        </label>
        {file && (
          <TextField
            margin="dense"
            id="file-name"
            label="Selected File"
            type="text"
            fullWidth
            value={file.name}
            disabled
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleUpload} color="primary">
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default YAMLUploadDialog;
