// Firebase Storage Service
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';
import { getAuth } from 'firebase/auth';

/**
 * Upload product image
 * @param {File} file - The file to upload
 * @param {string} path - The path in storage
 * @param {function} onProgress - Optional callback for progress updates (progress: number)
 */
export const uploadImage = async (file, path, onProgress) => {
  try {
    // Check if user is authenticated
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('You must be logged in to upload files');
    }

    const storageRef = ref(storage, `products/images/${path}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Upload error:', error);
          // Provide more helpful error messages
          if (error.code === 'storage/unauthorized') {
            reject(new Error('Permission denied. Please check Firebase Storage security rules and make sure you are logged in.'));
          } else if (error.code === 'storage/canceled') {
            reject(new Error('Upload was canceled.'));
          } else {
            reject(new Error(error.message || 'Failed to upload image'));
          }
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            // Report 100% progress
            if (onProgress) {
              onProgress(100);
            }
            resolve({ url: downloadURL, path: `products/images/${path}` });
          } catch (error) {
            reject(new Error('Failed to get download URL: ' + error.message));
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Upload digital file
 * @param {File} file - The file to upload
 * @param {string} path - The path in storage
 * @param {function} onProgress - Optional callback for progress updates (progress: number)
 */
export const uploadFile = async (file, path, onProgress) => {
  try {
    // Check if user is authenticated
    const auth = getAuth();
    if (!auth.currentUser) {
      throw new Error('You must be logged in to upload files');
    }

    const storageRef = ref(storage, `products/files/${path}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate and report progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Upload error:', error);
          // Provide more helpful error messages
          if (error.code === 'storage/unauthorized') {
            reject(new Error('Permission denied. Please check Firebase Storage security rules and make sure you are logged in.'));
          } else if (error.code === 'storage/canceled') {
            reject(new Error('Upload was canceled.'));
          } else {
            reject(new Error(error.message || 'Failed to upload file'));
          }
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            // Report 100% progress
            if (onProgress) {
              onProgress(100);
            }
            resolve({
              url: downloadURL,
              path: `products/files/${path}`,
              size: file.size,
              type: file.type,
              name: file.name,
            });
          } catch (error) {
            reject(new Error('Failed to get download URL: ' + error.message));
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Delete file from storage
 */
export const deleteFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    throw error;
  }
};
