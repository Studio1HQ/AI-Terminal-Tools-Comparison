import React, { createContext, useState, useContext, useEffect } from "react";

interface BlogContextType {
  content: string;
  setContent: (value: string) => void;
  saveDraft: (content: string, blogId: string) => void;
}

const BlogContext = createContext<BlogContextType | null>(null);

export const BlogProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem("blog-content") || "";
  });

  useEffect(() => {
    localStorage.setItem("blog-content", content);
  }, [content]);

  const saveDraft = (content: string, blogId: string) => {
    console.log(`Saving draft for blog ${blogId}:`, content);
    localStorage.setItem(`draft-${blogId}`, content);
  };

  return (
    <BlogContext.Provider value={{ content, setContent, saveDraft }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlog = () => {
  const ctx = useContext(BlogContext);
  if (!ctx) throw new Error("useBlog must be used within a BlogProvider");
  return ctx;
};
