// hooks/useNewsPosts.js
import { useState, useEffect, useCallback } from "react";
import { useSporticosApi } from "./useSporticosApi";

export const useNewsPosts = (options = {}) => {
  const {
    autoFetch = true,
    limit = 10,
    offset = 0,
    lang = "en",
    type = "posts", // "posts" | "guides"
  } = options;

  const { getPosts, getGuides, loading, error } = useSporticosApi();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchPosts = useCallback(async () => {
    const fn = type === "guides" ? getGuides : getPosts;
    const data = await fn({ limit, offset, isPublished: 1, lang });
    const list = data?.data?.data || data?.data || [];
    setPosts(list);
    setTotal(data?.data?.meta?.total || list.length);
    return list;
  }, [type, getPosts, getGuides, limit, offset, lang]);

  useEffect(() => {
    if (autoFetch) fetchPosts();
  }, [autoFetch, fetchPosts]);

  return {
    posts,
    total,
    loading,
    error,
    refetch: fetchPosts,
  };
};