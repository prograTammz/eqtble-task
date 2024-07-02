// src/YAMLQueryBuilder.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
  Grid,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import QueryResultDialog from "./ResultDialog";

const YAMLQueryBuilder = ({ fileId }) => {
  const [dimensions, setDimensions] = useState([]);
  const [measures, setMeasures] = useState([]);
  const [selectedDimensions, setSelectedDimensions] = useState([]);
  const [selectedMeasures, setSelectedMeasures] = useState([]);
  const [availableDimensions, setAvailableDimensions] = useState([]);
  const [availableMeasures, setAvailableMeasures] = useState([]);
  const [selectedDimension, setSelectedDimension] = useState("");
  const [selectedMeasure, setSelectedMeasure] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchParsedData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/yaml-files/${fileId}/parse/`
        );
        setDimensions(response.data.dimensions);
        setMeasures(response.data.measures);
        setAvailableDimensions(response.data.dimensions);
        setAvailableMeasures(response.data.measures);
      } catch (error) {
        console.error("Error fetching parsed data:", error);
      }
    };
    fetchParsedData();
  }, [fileId]);

  const handleAddDimension = () => {
    if (selectedDimension && !selectedDimensions.includes(selectedDimension)) {
      setSelectedDimensions([...selectedDimensions, selectedDimension]);
      setAvailableDimensions(
        availableDimensions.filter((d) => d !== selectedDimension)
      );
      setSelectedDimension("");
    }
  };

  const handleAddMeasure = () => {
    if (selectedMeasure && !selectedMeasures.includes(selectedMeasure)) {
      setSelectedMeasures([...selectedMeasures, selectedMeasure]);
      setAvailableMeasures(
        availableMeasures.filter((m) => m !== selectedMeasure)
      );
      setSelectedMeasure("");
    }
  };

  const handleRemoveDimension = (dimension) => {
    setSelectedDimensions(selectedDimensions.filter((d) => d !== dimension));
    setAvailableDimensions([...availableDimensions, dimension]);
  };

  const handleRemoveMeasure = (measure) => {
    setSelectedMeasures(selectedMeasures.filter((m) => m !== measure));
    setAvailableMeasures([...availableMeasures, measure]);
  };

  const handleCreateQuery = async () => {
    const queries = [
      ...selectedMeasures.map((measure) => ({
        type: "measure",
        name: measure,
      })),
      ...selectedDimensions.map((dimension) => ({
        type: "dimension",
        name: dimension,
      })),
    ];

    try {
      const response = await axios.post(
        `http://localhost:8000/api/yaml-files/${fileId}/query/`,
        { queries }
      );
      setQueryResult(response.data.results);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error creating query:", error);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Dimensions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Select
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>
              Select a dimension
            </MenuItem>
            {availableDimensions.map((dimension, index) => (
              <MenuItem key={index} value={dimension}>
                {dimension}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={handleAddDimension}
            variant="contained"
            color="primary"
            fullWidth
          >
            Add Dimension
          </Button>
        </Grid>
        <Grid item xs={6}>
          <List>
            {selectedDimensions.map((dimension, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveDimension(dimension)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={dimension} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      <Typography variant="h6" gutterBottom style={{ marginTop: 16 }}>
        Measures
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Select
            value={selectedMeasure}
            onChange={(e) => setSelectedMeasure(e.target.value)}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>
              Select a measure
            </MenuItem>
            {availableMeasures.map((measure, index) => (
              <MenuItem key={index} value={measure}>
                {measure}
              </MenuItem>
            ))}
          </Select>
          <Button
            onClick={handleAddMeasure}
            variant="contained"
            color="primary"
            fullWidth
          >
            Add Measure
          </Button>
        </Grid>
        <Grid item xs={6}>
          <List>
            {selectedMeasures.map((measure, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveMeasure(measure)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText primary={measure} />
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
      <Button
        onClick={handleCreateQuery}
        variant="contained"
        color="primary"
        style={{ marginTop: 16 }}
      >
        Create Query
      </Button>

      <QueryResultDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        result={queryResult}
      />
    </div>
  );
};

export default YAMLQueryBuilder;
