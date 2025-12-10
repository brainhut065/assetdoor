// Custom hook for users management
import { useState, useEffect } from 'react';
import {
  getUsers,
  getUser,
  getUserPurchases,
  updateUser,
} from '../services/firebase/firestore';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    setPage(1);
    setLastDoc(null);
    fetchUsers(true);
  }, []);

  const fetchUsers = async (reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const pagination = {
        pageSize,
        lastDoc: reset ? null : lastDoc,
      };
      
      const result = await getUsers(pagination);
      
      if (reset) {
        setUsers(result.users);
      } else {
        setUsers(prev => [...prev, ...result.users]);
      }
      
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchUsers(false);
    }
  };

  const resetPagination = () => {
    setPage(1);
    setLastDoc(null);
    fetchUsers(true);
  };

  const getUserById = async (id) => {
    try {
      return await getUser(id);
    } catch (err) {
      throw err;
    }
  };

  const fetchUserPurchases = async (userId) => {
    try {
      return await getUserPurchases(userId);
    } catch (err) {
      throw err;
    }
  };

  const updateUserStatus = async (id, isActive) => {
    try {
      await updateUser(id, { isActive });
      await fetchUsers();
    } catch (err) {
      throw err;
    }
  };

  return {
    users,
    loading,
    error,
    hasMore,
    loadMore,
    getUserById,
    fetchUserPurchases,
    updateUserStatus,
    refetch: resetPagination,
  };
};

