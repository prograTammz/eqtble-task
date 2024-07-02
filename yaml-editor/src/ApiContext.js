// src/ApiContext.js
import React, { createContext, useState, useContext } from "react";

const ApiContext = createContext();

export const useApi = () => useContext(ApiContext);

const ApiProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [history, setHistory] = useState({});

  const createFile = (name, content) => {
    const newFile = { id: Date.now().toString(), name, content };
    setFiles([...files, newFile]);
    setHistory({
      ...history,
      [newFile.id]: [{ content, timestamp: new Date() }],
    });
  };

  const deleteFile = (id) => {
    setFiles(files.filter((file) => file.id !== id));
    const { [id]: _, ...newHistory } = history;
    setHistory(newHistory);
  };

  const updateFile = (id, content) => {
    setFiles(
      files.map((file) => (file.id === id ? { ...file, content } : file))
    );
    setHistory({
      ...history,
      [id]: [...(history[id] || []), { content, timestamp: new Date() }],
    });
  };

  return (
    <ApiContext.Provider
      value={{ files, createFile, deleteFile, updateFile, history }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export default ApiProvider;
