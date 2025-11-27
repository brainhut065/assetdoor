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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
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
    addCategory,
    editCategory,
    removeCategory,
    refetch: fetchCategories,
  };
};

