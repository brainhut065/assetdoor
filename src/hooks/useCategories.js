// Custom hook for categories management
import { useState, useEffect } from 'react';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/firebase/firestore';

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [lastDocSnapshot, setLastDocSnapshot] = useState(null);
  const pageSize = 20;

  useEffect(() => {
    setLastDoc(null);
    setLastDocSnapshot(null);
    fetchCategories(true);
  }, []);

  const fetchCategories = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const pagination = {
        pageSize,
        lastDoc: reset ? null : lastDoc,
        lastDocSnapshot: reset ? null : lastDocSnapshot,
      };
      
      const result = await getCategories(pagination);
      
      if (reset) {
        setCategories(result.categories);
      } else {
        setCategories(prev => [...prev, ...result.categories]);
      }
      
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
      setLastDocSnapshot(result.lastDocSnapshot);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchCategories(false);
    }
  };

  const resetPagination = () => {
    setLastDoc(null);
    setLastDocSnapshot(null);
    fetchCategories(true);
  };

  const addCategory = async (categoryData) => {
    try {
      const id = await createCategory(categoryData);
      await fetchCategories();
      return id;
    } catch (err) {
      throw err;
    }
  };

  const editCategory = async (id, categoryData) => {
    try {
      await updateCategory(id, categoryData);
      await fetchCategories();
    } catch (err) {
      throw err;
    }
  };

  const removeCategory = async (id) => {
    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (err) {
      throw err;
    }
  };

  return {
    categories,
    loading,
    error,
    hasMore,
    loadMore,
    addCategory,
    editCategory,
    removeCategory,
    refetch: resetPagination,
  };
};

