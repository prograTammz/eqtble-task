// src/QueryResultDialog.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const QueryResultDialog = ({ open, onClose, result }) => {
  if (!result) {
    return null;
  }

  const { dimensions, ...measures } = result;

  console.log(measures);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
      <DialogTitle>Query Result</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>
          Measures
        </Typography>
        {Object.keys(measures).map((key) => (
          <Typography variant="body1">
            {key}: {measures[key]}
          </Typography>
        ))}
        <Typography variant="h6" gutterBottom style={{ marginTop: 16 }}>
          Dimensions
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(dimensions[0]).map((key, index) => (
                  <TableCell key={index}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dimensions.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, i) => (
                    <TableCell key={i}>{value}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default QueryResultDialog;
