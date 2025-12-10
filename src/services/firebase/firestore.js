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
  startAfter,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';

// ========== PRODUCTS ==========

// ========== IAP PRODUCT LINKING HELPERS ==========

/**
 * Update IAP product documents to reflect their linking status with products
 * @param {string} productId - The product document ID
 * @param {object|null} oldProductData - Previous product data (for edit) or null (for create)
 * @param {object} newProductData - New product data
 */
const updateIapProductLinks = async (productId, oldProductData, newProductData) => {
  try {
    console.log('========================================');
    console.log('updateIapProductLinks called');
    console.log('productId:', productId);
    console.log('oldProductData:', oldProductData);
    console.log('newProductData:', newProductData);
    
    const oldAndroidIapId = oldProductData?.iapProductIdAndroid || null;
    const oldIosIapId = oldProductData?.iapProductIdIOS || null;
    const newAndroidIapId = newProductData?.iapProductIdAndroid || null;
    const newIosIapId = newProductData?.iapProductIdIOS || null;

    console.log('oldAndroidIapId:', oldAndroidIapId);
    console.log('newAndroidIapId:', newAndroidIapId);
    console.log('oldIosIapId:', oldIosIapId);
    console.log('newIosIapId:', newIosIapId);

    // Handle Android IAP product
    // Unlink old Android IAP if it changed or was removed
    if (oldAndroidIapId && oldAndroidIapId !== newAndroidIapId) {
      console.log('Unlinking old Android IAP:', oldAndroidIapId);
      const oldAndroidIapRef = doc(db, 'iapProducts', oldAndroidIapId);
      const oldAndroidIapDoc = await getDoc(oldAndroidIapRef);
      if (oldAndroidIapDoc.exists()) {
        await updateDoc(oldAndroidIapRef, {
          linkedProductId: null,
          isLinked: false,
          updatedAt: Timestamp.now(),
        });
        console.log(`Unlinked Android IAP: ${oldAndroidIapId} from product: ${productId}`);
      } else {
        console.warn(`Old Android IAP document not found: ${oldAndroidIapId}`);
      }
    }

    // Link new Android IAP if it's set
    // Update even if IAP ID hasn't changed to ensure link status is correct
    if (newAndroidIapId) {
      console.log('Processing Android IAP:', newAndroidIapId);
      const newAndroidIapRef = doc(db, 'iapProducts', newAndroidIapId);
      const newAndroidIapDoc = await getDoc(newAndroidIapRef);
      if (newAndroidIapDoc.exists()) {
        const iapData = newAndroidIapDoc.data();
        console.log('Current IAP data:', {
          linkedProductId: iapData.linkedProductId,
          isLinked: iapData.isLinked,
          sku: iapData.sku,
        });
        console.log('Target productId:', productId);
        console.log('Should update?', iapData.linkedProductId !== productId || !iapData.isLinked);
        
        // Always update to ensure it's linked correctly
        await updateDoc(newAndroidIapRef, {
          linkedProductId: productId,
          isLinked: true,
          updatedAt: Timestamp.now(),
        });
        console.log(`✅ Linked Android IAP: ${newAndroidIapId} to product: ${productId}`);
      } else {
        console.error(`❌ Android IAP product document not found: ${newAndroidIapId}`);
        console.error('This means the IAP product does not exist in Firestore!');
      }
    } else {
      console.log('No Android IAP ID provided');
    }

    // Handle iOS IAP product
    // Unlink old iOS IAP if it changed or was removed
    if (oldIosIapId && oldIosIapId !== newIosIapId) {
      console.log('Unlinking old iOS IAP:', oldIosIapId);
      const oldIosIapRef = doc(db, 'iapProducts', oldIosIapId);
      const oldIosIapDoc = await getDoc(oldIosIapRef);
      if (oldIosIapDoc.exists()) {
        await updateDoc(oldIosIapRef, {
          linkedProductId: null,
          isLinked: false,
          updatedAt: Timestamp.now(),
        });
        console.log(`Unlinked iOS IAP: ${oldIosIapId} from product: ${productId}`);
      } else {
        console.warn(`Old iOS IAP document not found: ${oldIosIapId}`);
      }
    }

    // Link new iOS IAP if it's set
    // Update even if IAP ID hasn't changed to ensure link status is correct
    if (newIosIapId) {
      console.log('Processing iOS IAP:', newIosIapId);
      const newIosIapRef = doc(db, 'iapProducts', newIosIapId);
      const newIosIapDoc = await getDoc(newIosIapRef);
      if (newIosIapDoc.exists()) {
        const iapData = newIosIapDoc.data();
        console.log('Current IAP data:', {
          linkedProductId: iapData.linkedProductId,
          isLinked: iapData.isLinked,
          productId: iapData.productId,
        });
        
        // Always update to ensure it's linked correctly
        await updateDoc(newIosIapRef, {
          linkedProductId: productId,
          isLinked: true,
          updatedAt: Timestamp.now(),
        });
        console.log(`✅ Linked iOS IAP: ${newIosIapId} to product: ${productId}`);
      } else {
        console.error(`❌ iOS IAP product document not found: ${newIosIapId}`);
        console.error('This means the IAP product does not exist in Firestore!');
      }
    } else {
      console.log('No iOS IAP ID provided');
    }

    // If both IAPs are cleared (product is now free), ensure old IAPs are unlinked
    if (!newAndroidIapId && !newIosIapId) {
      if (oldAndroidIapId) {
        const oldAndroidIapRef = doc(db, 'iapProducts', oldAndroidIapId);
        const oldAndroidIapDoc = await getDoc(oldAndroidIapRef);
        if (oldAndroidIapDoc.exists()) {
          await updateDoc(oldAndroidIapRef, {
            linkedProductId: null,
            isLinked: false,
            updatedAt: Timestamp.now(),
          });
          console.log(`Unlinked Android IAP: ${oldAndroidIapId} (product is now free)`);
        }
      }
      if (oldIosIapId) {
        const oldIosIapRef = doc(db, 'iapProducts', oldIosIapId);
        const oldIosIapDoc = await getDoc(oldIosIapRef);
        if (oldIosIapDoc.exists()) {
          await updateDoc(oldIosIapRef, {
            linkedProductId: null,
            isLinked: false,
            updatedAt: Timestamp.now(),
          });
          console.log(`Unlinked iOS IAP: ${oldIosIapId} (product is now free)`);
        }
      }
    }

    console.log('========================================');
    console.log('updateIapProductLinks completed successfully');
    console.log('========================================');
  } catch (error) {
    console.error('========================================');
    console.error('❌ ERROR updating IAP product links:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    console.error('========================================');
    // Don't throw error - product creation/update should still succeed even if IAP linking fails
    // This is a non-critical operation
  }
};

export const getProducts = async (pagination = {}) => {
  try {
    const pageSize = pagination.pageSize || 20;
    const lastDoc = pagination.lastDoc || null;
    
    let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    
    // Add pagination
    if (pagination.lastDocSnapshot) {
      q = query(q, startAfter(pagination.lastDocSnapshot));
    } else if (lastDoc && lastDoc.id) {
      try {
        const lastDocRef = doc(db, 'products', lastDoc.id);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap));
        }
      } catch (err) {
        console.warn('Error getting lastDoc for pagination:', err);
      }
    }
    q = query(q, limit(pageSize + 1)); // Fetch one extra to check if there's more
    
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    
    // Store the last document snapshot for pagination (before popping if needed)
    let lastDocSnapshot = null;
    if (docs.length > 0) {
      const indexToUse = docs.length > pageSize ? pageSize - 1 : docs.length - 1;
      lastDocSnapshot = docs[indexToUse];
    }
    
    // Check if there's more data
    let hasMore = false;
    if (docs.length > pageSize) {
      hasMore = true;
      docs.pop(); // Remove the extra doc
    }
    
    const products = docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return {
      products,
      hasMore,
      lastDoc: products.length > 0 ? products[products.length - 1] : null,
      lastDocSnapshot,
    };
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
    const productId = docRef.id;

    // Update IAP product documents to link back to this product
    await updateIapProductLinks(productId, null, productData);

    return productId;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    // Get old product data to check previous IAP links
    const oldProductDoc = await getDoc(doc(db, 'products', id));
    const oldProductData = oldProductDoc.exists() ? oldProductDoc.data() : null;

    // Update product document
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, {
      ...productData,
      updatedAt: Timestamp.now(),
    });

    // Update IAP product documents (unlink old, link new)
    await updateIapProductLinks(id, oldProductData, productData);

  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    // Get product data before deleting to unlink IAP products
    const productDoc = await getDoc(doc(db, 'products', id));
    const productData = productDoc.exists() ? productDoc.data() : null;

    // Delete product
    await deleteDoc(doc(db, 'products', id));

    // Unlink IAP products if they were linked
    if (productData) {
      if (productData.iapProductIdAndroid) {
        const androidIapRef = doc(db, 'iapProducts', productData.iapProductIdAndroid);
        const androidIapDoc = await getDoc(androidIapRef);
        if (androidIapDoc.exists()) {
          await updateDoc(androidIapRef, {
            linkedProductId: null,
            isLinked: false,
            updatedAt: Timestamp.now(),
          });
          console.log(`Unlinked Android IAP: ${productData.iapProductIdAndroid} (product deleted)`);
        }
      }
      if (productData.iapProductIdIOS) {
        const iosIapRef = doc(db, 'iapProducts', productData.iapProductIdIOS);
        const iosIapDoc = await getDoc(iosIapRef);
        if (iosIapDoc.exists()) {
          await updateDoc(iosIapRef, {
            linkedProductId: null,
            isLinked: false,
            updatedAt: Timestamp.now(),
          });
          console.log(`Unlinked iOS IAP: ${productData.iapProductIdIOS} (product deleted)`);
        }
      }
    }
  } catch (error) {
    throw error;
  }
};

// ========== CATEGORIES ==========

export const getCategories = async (pagination = {}) => {
  try {
    const pageSize = pagination.pageSize || 20;
    const lastDoc = pagination.lastDoc || null;
    
    // Categories have createdAt field (from createCategory function)
    let q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    
    // Add pagination
    if (pagination.lastDocSnapshot) {
      q = query(q, startAfter(pagination.lastDocSnapshot));
    } else if (lastDoc && lastDoc.id) {
      try {
        const lastDocRef = doc(db, 'categories', lastDoc.id);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap));
        }
      } catch (err) {
        console.warn('Error getting lastDoc for pagination:', err);
      }
    }
    q = query(q, limit(pageSize + 1)); // Fetch one extra to check if there's more
    
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    
    // Store the last document snapshot for pagination (before popping if needed)
    let lastDocSnapshot = null;
    if (docs.length > 0) {
      const indexToUse = docs.length > pageSize ? pageSize - 1 : docs.length - 1;
      lastDocSnapshot = docs[indexToUse];
    }
    
    // Check if there's more data
    let hasMore = false;
    if (docs.length > pageSize) {
      hasMore = true;
      docs.pop(); // Remove the extra doc
    }
    
    const categories = docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return {
      categories,
      hasMore,
      lastDoc: categories.length > 0 ? categories[categories.length - 1] : null,
      lastDocSnapshot,
    };
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

export const getPurchases = async (filters = {}, pagination = {}) => {
  try {
    const pageSize = pagination.pageSize || 20;
    const lastDoc = pagination.lastDoc || null;
    
    let q = query(collection(db, 'purchases'), orderBy('purchaseDate', 'desc'));
    
    if (filters.userId) {
      q = query(q, where('userId', '==', filters.userId));
    }
    if (filters.productId) {
      q = query(q, where('productId', '==', filters.productId));
    }
    
    // Handle date range first (if provided)
    if (filters.startDate && filters.endDate) {
      // Convert date strings to Firestore Timestamps
      // Date strings come in format "YYYY-MM-DD"
      const startDate = new Date(filters.startDate);
      startDate.setHours(0, 0, 0, 0); // Start of day
      const startTimestamp = Timestamp.fromDate(startDate);
      
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      const endTimestamp = Timestamp.fromDate(endDate);
      
      q = query(q,
        where('purchaseDate', '>=', startTimestamp),
        where('purchaseDate', '<=', endTimestamp)
      );
    }
    
    // Add pagination
    if (pagination.lastDocSnapshot) {
      // Use the document snapshot directly if provided
      q = query(q, startAfter(pagination.lastDocSnapshot));
    } else if (lastDoc && lastDoc.id) {
      // Fallback: get the document snapshot
      try {
        const lastDocRef = doc(db, 'purchases', lastDoc.id);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap));
    }
      } catch (err) {
        console.warn('Error getting lastDoc for pagination:', err);
      }
    }
    q = query(q, limit(pageSize + 1)); // Fetch one extra to check if there's more
    
    // Handle status filter - apply after date filter to avoid composite index issues
    // If status filter is used with date filter, we'll filter client-side
    let purchases = [];
    let hasMore = false;
    let lastDocSnapshot = null;
    
    try {
    const snapshot = await getDocs(q);
      const docs = snapshot.docs;
      
      // Store the last document snapshot for pagination (before popping if needed)
      // Use the last doc that will be returned (pageSize - 1 if we have more, or last one if not)
      if (docs.length > 0) {
        const indexToUse = docs.length > pageSize ? pageSize - 1 : docs.length - 1;
        lastDocSnapshot = docs[indexToUse];
      }
      
      // Check if there's more data
      if (docs.length > pageSize) {
        hasMore = true;
        docs.pop(); // Remove the extra doc
      }
      
      purchases = docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      // If query fails (likely due to missing composite index), try without orderBy
      if (error.code === 'failed-precondition') {
        console.warn('Composite index missing, fetching without orderBy and sorting client-side');
        let fallbackQ = query(collection(db, 'purchases'));
        
        if (filters.userId) {
          fallbackQ = query(fallbackQ, where('userId', '==', filters.userId));
        }
        if (filters.productId) {
          fallbackQ = query(fallbackQ, where('productId', '==', filters.productId));
        }
        if (filters.startDate && filters.endDate) {
          const startDate = new Date(filters.startDate);
          startDate.setHours(0, 0, 0, 0);
          const startTimestamp = Timestamp.fromDate(startDate);
          
          const endDate = new Date(filters.endDate);
          endDate.setHours(23, 59, 59, 999);
          const endTimestamp = Timestamp.fromDate(endDate);
          
          fallbackQ = query(fallbackQ,
            where('purchaseDate', '>=', startTimestamp),
            where('purchaseDate', '<=', endTimestamp)
          );
        }
        
        const snapshot = await getDocs(fallbackQ);
        purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort client-side
        purchases.sort((a, b) => {
          const dateA = a.purchaseDate?.toDate ? a.purchaseDate.toDate() : new Date(a.purchaseDate);
          const dateB = b.purchaseDate?.toDate ? b.purchaseDate.toDate() : new Date(b.purchaseDate);
          return dateB - dateA; // Descending
        });
        
        // Apply client-side pagination
        const startIndex = pagination.page ? (pagination.page - 1) * pageSize : 0;
        hasMore = purchases.length > startIndex + pageSize;
        purchases = purchases.slice(startIndex, startIndex + pageSize);
      } else {
        throw error;
      }
    }
    
    // Apply status filter client-side to avoid composite index issues
    if (filters.status && filters.status !== 'All') {
      purchases = purchases.filter(p => p.status === filters.status);
    }
    
    // Return with lastDocSnapshot (already captured above in try block)
    return {
      purchases,
      hasMore,
      lastDoc: purchases.length > 0 ? purchases[purchases.length - 1] : null,
      lastDocSnapshot: lastDocSnapshot || null,
    };
  } catch (error) {
    console.error('Error fetching purchases:', error);
    throw error;
  }
};

// Get total count for pagination (optional, can be expensive)
export const getPurchasesCount = async (filters = {}) => {
  try {
    // For now, we'll estimate based on fetched data
    // In production, you might want to maintain a count document
    const result = await getPurchases(filters, { pageSize: 1 });
    return result.purchases.length;
  } catch (error) {
    console.error('Error getting purchases count:', error);
    return 0;
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

export const getUsers = async (pagination = {}) => {
  try {
    const pageSize = pagination.pageSize || 20;
    const lastDoc = pagination.lastDoc || null;
    
    // First, try to get users from users collection
    try {
      let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      
      // Add pagination
      if (lastDoc) {
        // Need to get the actual document snapshot for startAfter
        const lastDocRef = doc(db, 'users', lastDoc.id);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap));
        }
      }
      q = query(q, limit(pageSize + 1)); // Fetch one extra to check if there's more
      
      const usersSnapshot = await getDocs(q);
      const docs = usersSnapshot.docs;
      
      // Check if there's more data
      let hasMore = false;
      if (docs.length > pageSize) {
        hasMore = true;
        docs.pop(); // Remove the extra doc
      }
      
      const usersFromCollection = docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If users collection has data, return it
      if (usersFromCollection.length > 0) {
        return {
          users: usersFromCollection,
          hasMore,
          lastDoc: usersFromCollection.length > 0 ? usersFromCollection[usersFromCollection.length - 1] : null,
        };
      }
    } catch (error) {
      // If orderBy fails (no index), try without orderBy
      console.warn('Error fetching users with orderBy, trying without:', error);
    }
    
    // Otherwise, sync users from purchases
    console.log('Users collection is empty. Syncing users from purchases...');
    const syncedUsers = await syncUsersFromPurchases();
    
    // Sort synced users by createdAt descending
    syncedUsers.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA; // Descending
    });
    
    // Apply pagination to synced users
    let startIndex = 0;
    if (lastDoc) {
      // Find the index of the lastDoc in the sorted array
      const lastDocIndex = syncedUsers.findIndex(u => u.id === lastDoc.id);
      if (lastDocIndex >= 0) {
        startIndex = lastDocIndex + 1;
      }
    }
    
    const paginatedUsers = syncedUsers.slice(startIndex, startIndex + pageSize);
    const hasMoreSynced = syncedUsers.length > startIndex + pageSize;
    
    return {
      users: paginatedUsers,
      hasMore: hasMoreSynced,
      lastDoc: paginatedUsers.length > 0 ? paginatedUsers[paginatedUsers.length - 1] : null,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Sync users from purchases data
 * Creates user documents in Firestore based on purchase records
 */
const syncUsersFromPurchases = async () => {
  try {
    // Get all purchases
    const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
    const purchases = purchasesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Group purchases by userId
    const usersMap = new Map();
    
    purchases.forEach(purchase => {
      const userId = purchase.userId;
      if (!userId) return;
      
      if (!usersMap.has(userId)) {
        // Create user object from first purchase
        usersMap.set(userId, {
          id: userId,
          email: purchase.userEmail || '',
          displayName: purchase.userName || purchase.userEmail || 'User',
          photoURL: null,
          isActive: true,
          createdAt: purchase.purchaseDate || Timestamp.now(),
          lastLogin: purchase.purchaseDate || Timestamp.now(),
          totalPurchases: 0,
          totalSpent: 0,
        });
      }
      
      // Update user stats
      const user = usersMap.get(userId);
      user.totalPurchases += 1;
      
      // Calculate total spent (use numeric price)
      const price = purchase.productPrice || 0;
      user.totalSpent += price;
      
      // Update lastLogin to most recent purchase
      const purchaseDate = purchase.purchaseDate?.toDate ? purchase.purchaseDate.toDate() : new Date(purchase.purchaseDate);
      const lastLoginDate = user.lastLogin?.toDate ? user.lastLogin.toDate() : new Date(user.lastLogin);
      if (purchaseDate > lastLoginDate) {
        user.lastLogin = purchase.purchaseDate || user.lastLogin;
      }
      
      // Update createdAt to earliest purchase
      const createdAtDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
      if (purchaseDate < createdAtDate) {
        user.createdAt = purchase.purchaseDate || user.createdAt;
      }
    });
    
    // Convert map to array
    const users = Array.from(usersMap.values());
    
    // Optionally, save users to Firestore for future use
    // This is async and won't block the return
    if (users.length > 0) {
      // Save in batches (Firestore limit is 500 per batch)
      const batchSize = 500;
      for (let i = 0; i < users.length; i += batchSize) {
        const batchChunk = users.slice(i, i + batchSize);
        const batch = writeBatch(db);
        
        batchChunk.forEach(user => {
          const userRef = doc(db, 'users', user.id);
          batch.set(userRef, {
            ...user,
            updatedAt: Timestamp.now(),
          }, { merge: true });
        });
        
        await batch.commit();
      }
      
      console.log(`Synced ${users.length} users from purchases to Firestore`);
    }
    
    return users;
  } catch (error) {
    console.error('Error syncing users from purchases:', error);
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

// ========== IAP PRODUCTS ==========

export const getIapProducts = async (pagination = {}) => {
  try {
    const pageSize = pagination.pageSize || 20;
    const lastDoc = pagination.lastDoc || null;
    
    let q = query(collection(db, 'iapProducts'), orderBy('lastSynced', 'desc'));
    
    // Add pagination
    if (pagination.lastDocSnapshot) {
      q = query(q, startAfter(pagination.lastDocSnapshot));
    } else if (lastDoc && lastDoc.id) {
      try {
        const lastDocRef = doc(db, 'iapProducts', lastDoc.id);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap));
        }
      } catch (err) {
        console.warn('Error getting lastDoc for pagination:', err);
      }
    }
    q = query(q, limit(pageSize + 1)); // Fetch one extra to check if there's more
    
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    
    // Store the last document snapshot for pagination (before popping if needed)
    let lastDocSnapshot = null;
    if (docs.length > 0) {
      const indexToUse = docs.length > pageSize ? pageSize - 1 : docs.length - 1;
      lastDocSnapshot = docs[indexToUse];
    }
    
    // Check if there's more data
    let hasMore = false;
    if (docs.length > pageSize) {
      hasMore = true;
      docs.pop(); // Remove the extra doc
    }
    
    const iapProducts = docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return {
      iapProducts,
      hasMore,
      lastDoc: iapProducts.length > 0 ? iapProducts[iapProducts.length - 1] : null,
      lastDocSnapshot,
    };
  } catch (error) {
    throw error;
  }
};

export const getIapProduct = async (id) => {
  try {
    const docRef = doc(db, 'iapProducts', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    throw error;
  }
};

export const getIapProductsByPlatform = async (platform, pagination = {}) => {
  try {
    const pageSize = pagination.pageSize || 20;
    const lastDoc = pagination.lastDoc || null;
    
    let q = query(
      collection(db, 'iapProducts'),
      where('platform', '==', platform),
      orderBy('lastSynced', 'desc')
    );
    
    // Add pagination
    if (pagination.lastDocSnapshot) {
      q = query(q, startAfter(pagination.lastDocSnapshot));
    } else if (lastDoc && lastDoc.id) {
      try {
        const lastDocRef = doc(db, 'iapProducts', lastDoc.id);
        const lastDocSnap = await getDoc(lastDocRef);
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap));
        }
      } catch (err) {
        console.warn('Error getting lastDoc for pagination:', err);
      }
    }
    q = query(q, limit(pageSize + 1)); // Fetch one extra to check if there's more
    
    const snapshot = await getDocs(q);
    const docs = snapshot.docs;
    
    // Store the last document snapshot for pagination (before popping if needed)
    let lastDocSnapshot = null;
    if (docs.length > 0) {
      const indexToUse = docs.length > pageSize ? pageSize - 1 : docs.length - 1;
      lastDocSnapshot = docs[indexToUse];
    }
    
    // Check if there's more data
    let hasMore = false;
    if (docs.length > pageSize) {
      hasMore = true;
      docs.pop(); // Remove the extra doc
    }
    
    const iapProducts = docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    return {
      iapProducts,
      hasMore,
      lastDoc: iapProducts.length > 0 ? iapProducts[iapProducts.length - 1] : null,
      lastDocSnapshot,
    };
  } catch (error) {
    throw error;
  }
};

export const getIapSyncStatus = async () => {
  try {
    const docRef = doc(db, 'iapProducts', '_sync_status');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
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

