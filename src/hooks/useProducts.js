// Custom hook for products management
import { useState, useEffect } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../services/firebase/firestore';

export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
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
    addProduct,
    editProduct,
    removeProduct,
    refetch: fetchProducts,
  };
};

