// Auth Context for managing authentication state
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logout as firebaseLogout } from '../services/firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase/config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Function to process admin status
  const processAdminStatus = async (firebaseUser) => {
    try {
      const adminDocRef = doc(db, 'admins', firebaseUser.uid);
      const adminDoc = await getDoc(adminDocRef);
      
      if (adminDoc.exists()) {
        // User is admin - update lastLogin
        setUser(firebaseUser);
        setAdminData(adminDoc.data());
        setAuthError(null);
        
        // Update lastLogin timestamp (don't wait for this)
        setDoc(adminDocRef, {
          lastLogin: Timestamp.now(),
        }, { merge: true }).catch(err => {
          console.warn('Could not update lastLogin:', err);
        });
        
        return true;
      } else {
        // Admin document doesn't exist - create it automatically
        console.log('Admin document not found. Creating admin document...');
        try {
          const newAdminData = {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
            role: 'admin',
            isActive: true,
            createdAt: Timestamp.now(),
            lastLogin: Timestamp.now(),
          };
          
          await setDoc(adminDocRef, newAdminData);
          
          // Fetch the newly created document
          const newAdminDoc = await getDoc(adminDocRef);
          if (newAdminDoc.exists()) {
            setUser(firebaseUser);
            setAdminData(newAdminDoc.data());
            setAuthError(null);
            console.log('Admin document created successfully!');
            return true;
          } else {
            throw new Error('Admin document was not created');
          }
        } catch (createError) {
          console.error('Error creating admin document:', createError);
          setAuthError(`Could not create admin document: ${createError.message}. Please check Firestore security rules.`);
          // Still set user but show error
          setUser(firebaseUser);
          setAdminData({
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
            role: 'admin',
            isActive: true,
          });
          return true; // Still allow login
        }
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAuthError(`Firestore error: ${error.message}. Please check security rules.`);
      // If Firestore is not accessible, still allow login but show warning
      setUser(firebaseUser);
      setAdminData({
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
        role: 'admin',
        isActive: true,
      });
      return true; // Still allow login
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        await processAdminStatus(firebaseUser);
      } else {
        setUser(null);
        setAdminData(null);
        setAuthError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      // Import login function dynamically to avoid circular dependency
      const { login: firebaseLogin } = await import('../services/firebase/auth');
      const userCredential = await firebaseLogin(email, password);
      
      // Wait for admin status to be processed
      await processAdminStatus(userCredential);
      
      return userCredential;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await firebaseLogout();
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    adminData,
    loading,
    authError,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
