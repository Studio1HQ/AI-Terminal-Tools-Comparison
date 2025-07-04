import React from "react";
import { useBlog } from "./BlogContext";
import { useAutosave } from "./useAutosave";

export const Editor = () => {
  const { content, setContent } = useBlog();
  const blogId = "default-blog-id";

  useAutosave(content || "", blogId);
  
  return (
    <textarea
      value={content || ""}
      onChange={(e) => setContent(e.target.value)}
      rows={10}
      cols={50}
      placeholder="Start writing your blog post..."
    />
  );
};