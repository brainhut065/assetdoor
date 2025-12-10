// Custom hook for IAP products management
import { useState, useEffect } from 'react';
import {
  getIapProducts,
  getIapProductsByPlatform,
  getIapSyncStatus,
} from '../services/firebase/firestore';

export const useIapProducts = (filters = {}) => {
  const [iapProducts, setIapProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);


  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [lastDocSnapshot, setLastDocSnapshot] = useState(null);
  const pageSize = 20;

  useEffect(() => {
    setLastDoc(null);
    setLastDocSnapshot(null);
    fetchIapProducts(true);
    fetchSyncStatus();
  }, [filters.platform]);

  const fetchIapProducts = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const pagination = {
        pageSize,
        lastDoc: reset ? null : lastDoc,
        lastDocSnapshot: reset ? null : lastDocSnapshot,
      };
      
      let result;
      if (filters.platform && filters.platform !== 'All') {
        result = await getIapProductsByPlatform(filters.platform, pagination);
      } else {
        result = await getIapProducts(pagination);
      }
      
      if (reset) {
        setIapProducts(result.iapProducts);
      } else {
        setIapProducts(prev => [...prev, ...result.iapProducts]);
      }
      
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
      setLastDocSnapshot(result.lastDocSnapshot);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching IAP products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchIapProducts(false);
    }
  };

  const resetPagination = () => {
    setLastDoc(null);
    setLastDocSnapshot(null);
    fetchIapProducts(true);
  };

  const fetchSyncStatus = async () => {
    try {
      const status = await getIapSyncStatus();
      setSyncStatus(status);
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  };

  const triggerManualSync = async () => {
    try {
      // Call the manual sync Cloud Function
      const functionUrl = `https://us-central1-assetdoor-4c2a9.cloudfunctions.net/manualSyncGooglePlayProducts`;
      
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Refresh data after sync
      setTimeout(() => {
        resetPagination();
        fetchSyncStatus();
      }, 2000); // Wait 2 seconds for sync to complete
      
      return result;
    } catch (err) {
      // Handle network errors (CORS, connection issues, etc.)
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Network error: Unable to reach the sync function. Please check your internet connection and ensure the function is deployed.');
      }
      
      // Extract error message properly
      const errorMessage = err.message || err.toString() || 'Unknown error occurred';
      throw new Error(errorMessage);
    }
  };

  return {
    iapProducts,
    loading,
    error,
    hasMore,
    loadMore,
    syncStatus,
    refetch: resetPagination,
    triggerManualSync,
  };
};

