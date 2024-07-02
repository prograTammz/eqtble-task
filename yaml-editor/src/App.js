// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import YAMLFileList from "./pages/FileList";
import YAMLEditorPage from "./pages/Editor";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import "ace-builds/webpack-resolver";

function App() {
  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            YAML Manager
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<YAMLFileList />} />
          <Route path="/edit/:id" element={<YAMLEditorPage />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
