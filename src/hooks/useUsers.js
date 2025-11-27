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

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
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
    getUserById,
    fetchUserPurchases,
    updateUserStatus,
    refetch: fetchUsers,
  };
};

