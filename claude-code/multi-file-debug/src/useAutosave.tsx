import { useEffect } from "react";
import { useBlog } from "./BlogContext";

export const useAutosave = (content: string, blogId: string) => {
  const { saveDraft } = useBlog();
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (content && blogId) saveDraft(content, blogId);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [content, blogId, saveDraft]);
};