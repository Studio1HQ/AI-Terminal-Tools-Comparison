import React from "react";
import ReactDOM from "react-dom/client";
import { BlogProvider } from "./BlogContext";
import { Editor } from "./Editor";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BlogProvider>
      <Editor />
    </BlogProvider>
  </React.StrictMode>
);
