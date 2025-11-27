// Utility functions for formatting data
import { format } from 'date-fns';

export const formatPrice = (price) => {
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  return price || '$0.00';
};

export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

