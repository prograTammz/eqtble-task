// src/YAMLFileList.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
} from "@mui/icons-material";
import YAMLUploadDialog from "./UploadDialog";

const YAMLFileList = () => {
  const [files, setFiles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/yaml-files/"
        );
        setFiles(response.data);
      } catch (error) {
        console.error("Error fetching the YAML files:", error);
      }
    };
    fetchData();
  }, []);

  const refreshFiles = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/yaml-files/");
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching the YAML files:", error);
    }
  };

  const handleDelete = async (id, event) => {
    event.stopPropagation(); // Prevent the row click event
    try {
      await axios.delete(`http://localhost:8000/api/yaml-files/${id}/`);
      setFiles(files.filter((file) => file.id !== id));
    } catch (error) {
      console.error("Error deleting the YAML file:", error);
    }
  };

  const handleRowClick = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleUploadClick = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        YAML Files
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/edit/new")}
        style={{ marginRight: 8 }}
      >
        Add YAML File
      </Button>
      <Button
        variant="contained"
        color="secondary"
        startIcon={<CloudUploadIcon />}
        onClick={handleUploadClick}
      >
        Upload YAML File
      </Button>
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Modified At</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.map((file) => (
              <TableRow
                key={file.id}
                hover
                onClick={() => handleRowClick(file.id)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>{file.id}</TableCell>
                <TableCell>{file.name}</TableCell>
                <TableCell>
                  {new Date(file.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(file.modified_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton
                    edge="end"
                    onClick={(event) => handleDelete(file.id, event)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <YAMLUploadDialog
        open={openDialog}
        handleClose={handleClose}
        action={refreshFiles}
      />
    </div>
  );
};

export default YAMLFileList;
