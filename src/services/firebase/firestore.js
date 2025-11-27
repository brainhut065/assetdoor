// Firestore Service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './config';

// ========== PRODUCTS ==========

export const getProducts = async () => {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    throw error;
  }
};

// ========== CATEGORIES ==========

export const getCategories = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const getCategory = async (id) => {
  try {
    const docRef = doc(db, 'categories', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(db, 'categories'), {
      ...categoryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const updateCategory = async (id, categoryData) => {
  try {
    const docRef = doc(db, 'categories', id);
    await updateDoc(docRef, {
      ...categoryData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    throw error;
  }
};

// ========== PURCHASES ==========

export const getPurchases = async (filters = {}) => {
  try {
    let q = query(collection(db, 'purchases'), orderBy('purchaseDate', 'desc'));
    
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.productId) {
      q = query(q, where('productId', '==', filters.productId));
    }
    if (filters.status && filters.status !== 'All') {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters.startDate && filters.endDate) {
      q = query(q,
        where('purchaseDate', '>=', filters.startDate),
        where('purchaseDate', '<=', filters.endDate)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const getPurchase = async (id) => {
  try {
    const docRef = doc(db, 'purchases', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw error;
  }
};

export const updatePurchase = async (id, purchaseData) => {
  try {
    const docRef = doc(db, 'purchases', id);
    await updateDoc(docRef, {
      ...purchaseData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw error;
  }
};

export const getPurchaseStats = async (startDate, endDate) => {
  try {
    let q = query(collection(db, 'purchases'), where('status', '==', 'completed'));
    
    if (startDate && endDate) {
      q = query(q,
        where('purchaseDate', '>=', startDate),
        where('purchaseDate', '<=', endDate)
      );
    }
    
    const snapshot = await getDocs(q);
    const purchases = snapshot.docs.map(doc => doc.data());
    
    return {
      totalPurchases: purchases.length,
      totalRevenue: purchases.reduce((sum, p) => sum + (p.productPrice || 0), 0),
      averageOrderValue: purchases.length > 0
        ? purchases.reduce((sum, p) => sum + (p.productPrice || 0), 0) / purchases.length
        : 0,
    };
  } catch (error) {
    throw error;
  }
};

// ========== USERS ==========

export const getUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw error;
  }
};

export const getUserPurchases = async (userId) => {
  try {
    const q = query(
      collection(db, 'purchases'),
      where('userId', '==', userId),
      orderBy('purchaseDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, {
      ...userData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    throw error;
  }
};

// ========== STATISTICS ==========

export const getDashboardStats = async () => {
  try {
    // Get all products
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const products = productsSnapshot.docs.map(doc => doc.data());
    const activeProducts = products.filter(p => p.isActive !== false).length;
    
    // Get all categories
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoriesCount = categoriesSnapshot.size;
    
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersCount = usersSnapshot.size;
    
    // Get all purchases
    const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
    const purchases = purchasesSnapshot.docs.map(doc => doc.data());
    const completedPurchases = purchases.filter(p => p.status === 'completed');
    const totalRevenue = completedPurchases.reduce((sum, p) => sum + (p.productPrice || 0), 0);
    
    return {
      totalProducts: products.length,
      activeProducts,
      totalCategories: categoriesCount,
      totalUsers: usersCount,
      totalPurchases: purchases.length,
      totalRevenue,
    };
  } catch (error) {
    throw error;
  }
};

