// Custom hook for purchases management
import { useState, useEffect } from 'react';
import {
  getPurchases,
  getPurchase,
  updatePurchase,
  getPurchaseStats,
} from '../services/firebase/firestore';

export const usePurchases = (filters = {}) => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, [filters]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPurchases(filters);
      setPurchases(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPurchaseById = async (id) => {
    try {
      return await getPurchase(id);
    } catch (err) {
      throw err;
    }
  };

  const updatePurchaseStatus = async (id, status, refundData = {}) => {
    try {
      await updatePurchase(id, {
        status,
        ...refundData,
      });
      await fetchPurchases();
    } catch (err) {
      throw err;
    }
  };

  const fetchStats = async (startDate, endDate) => {
    try {
      return await getPurchaseStats(startDate, endDate);
    } catch (err) {
      throw err;
    }
  };

  return {
    purchases,
    loading,
    error,
    getPurchaseById,
    updatePurchaseStatus,
    fetchStats,
    refetch: fetchPurchases,
  };
};

