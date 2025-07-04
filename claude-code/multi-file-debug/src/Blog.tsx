import React from "react";
import { Editor } from "./Editor";

// This would usually come from a data source, like an API call
const blogId = "123";

export const Blog = () => {
  return <Editor blogId={blogId} />;
};