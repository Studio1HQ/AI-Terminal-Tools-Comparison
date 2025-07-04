import React from "react";
import ReactDOM from "react-dom/client";
import { BlogProvider } from "./BlogContext"; // Added import
import { Editor } from "./Editor";

// Wrapped with BlogProvider
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BlogProvider>
      <Editor />
    </BlogProvider>
  </React.StrictMode>
);