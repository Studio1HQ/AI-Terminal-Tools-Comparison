import React, { createContext, useState, useContext } from "react";

interface BlogContextType {
  content: string | null;
  setContent: (value: string) => void;
  saveDraft: (content: string, blogId: string) => void;
}

export const BlogContext = createContext<BlogContextType | null>(null);

export const BlogProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<string | null>("Hello world!");

  const saveDraft = (content: string, blogId: string) => {
    console.log(`Saving draft for blog ${blogId}:`, content);
  };

  return (
    <BlogContext.Provider value={{ content, setContent, saveDraft }}>
      {children}
    </BlogContext.Provider>
  );
};

// Safe context consumer
export const useBlog = () => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog must be used within a BlogProvider");
  return ctx;
};
