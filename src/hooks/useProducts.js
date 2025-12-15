// Custom hook for products management
import { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/firebase/firestore';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [lastDocSnapshot, setLastDocSnapshot] = useState(null);
  const pageSize = 20;

  useEffect(() => {
    setLastDoc(null);
    setLastDocSnapshot(null);
    fetchProducts(true);
  }, [filters.categoryId]); // Refetch when category filter changes

  const fetchProducts = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const pagination = {
        pageSize,
        lastDoc: reset ? null : lastDoc,
        lastDocSnapshot: reset ? null : lastDocSnapshot,
      };
      
      const result = await getProducts(pagination, filters);
      
      if (reset) {
        setProducts(result.products);
      } else {
        setProducts(prev => [...prev, ...result.products]);
      }
      
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
      setLastDocSnapshot(result.lastDocSnapshot);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(false);
    }
  };

  const resetPagination = () => {
    setLastDoc(null);
    setLastDocSnapshot(null);
    fetchProducts(true);
  };

  const addProduct = async (productData) => {
    try {
      const id = await createProduct(productData);
      await fetchProducts();
      return id;
    } catch (err) {
      throw err;
    }
  };

  const editProduct = async (id, productData) => {
    try {
      await updateProduct(id, productData);
      await fetchProducts();
    } catch (err) {
      throw err;
    }
  };

  const removeProduct = async (id) => {
    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    addProduct,
    editProduct,
    removeProduct,
    refetch: resetPagination,
  };
};

