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
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [lastDocSnapshot, setLastDocSnapshot] = useState(null);
  const pageSize = 20;

  useEffect(() => {
    setLastDoc(null);
    setLastDocSnapshot(null);
    fetchPurchases(true);
  }, [filters]);

  const fetchPurchases = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const pagination = {
        pageSize,
        lastDoc: reset ? null : lastDoc,
        lastDocSnapshot: reset ? null : lastDocSnapshot,
      };
      
      const result = await getPurchases(filters, pagination);
      
      if (reset) {
        setPurchases(result.purchases);
      } else {
        setPurchases(prev => [...prev, ...result.purchases]);
      }
      
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
      setLastDocSnapshot(result.lastDocSnapshot);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchPurchases(false);
    }
  };

  const resetPagination = () => {
    setLastDoc(null);
    setLastDocSnapshot(null);
    fetchPurchases(true);
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
    hasMore,
    loadMore,
    getPurchaseById,
    updatePurchaseStatus,
    fetchStats,
    refetch: resetPagination,
  };
};

