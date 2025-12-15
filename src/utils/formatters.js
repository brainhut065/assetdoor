// Utility functions for formatting data
import { format } from 'date-fns';

/**
 * Format price with currency
 * @param {number|string} price - Price value or formatted string
 * @param {string} formattedPrice - Optional formatted price string (e.g., "INR 99.00")
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, formattedPrice = null) => {
  // If formatted price is provided, use it (it already has currency)
  if (formattedPrice && typeof formattedPrice === 'string' && formattedPrice.trim()) {
    return formattedPrice;
  }
  
  // If price is a number, default to USD
  if (typeof price === 'number') {
    return `$${price.toFixed(2)}`;
  }
  
  // If price is already a string, return it
  if (typeof price === 'string') {
    return price;
  }
  
  return '$0.00';
};

/**
 * Extract currency from formatted price string
 * @param {string} formattedPrice - Formatted price string (e.g., "INR 99.00", "USD 9.99")
 * @returns {string} Currency code (e.g., "INR", "USD", "EUR")
 */
export const extractCurrency = (formattedPrice) => {
  if (!formattedPrice || typeof formattedPrice !== 'string') {
    return 'USD'; // Default currency
  }
  
  // Try to extract currency code (first word before space)
  const match = formattedPrice.trim().match(/^([A-Z]{3})\s/);
  if (match) {
    return match[1];
  }
  
  // Check for currency symbols
  if (formattedPrice.includes('₹') || formattedPrice.includes('INR')) {
    return 'INR';
  }
  if (formattedPrice.includes('€') || formattedPrice.includes('EUR')) {
    return 'EUR';
  }
  if (formattedPrice.includes('$') || formattedPrice.includes('USD')) {
    return 'USD';
  }
  
  return 'USD'; // Default
};

/**
 * Extract numeric value from formatted price string
 * @param {string} formattedPrice - Formatted price string
 * @returns {number} Numeric price value
 */
export const extractPriceValue = (formattedPrice) => {
  if (!formattedPrice || typeof formattedPrice !== 'string') {
    return 0;
  }
  
  // Extract numbers (including decimals)
  const match = formattedPrice.match(/[\d,]+\.?\d*/);
  if (match) {
    return parseFloat(match[0].replace(/,/g, ''));
  }
  
  return 0;
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

/**
 * Format a numeric amount in a specific currency
 * @param {number} amount - Numeric price amount
 * @param {string} currency - Currency code (e.g., "INR", "USD", "EUR")
 * @returns {string} Formatted price string in the specified currency
 */
export const formatAmountInCurrency = (amount, currency) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'FREE';
  }
  
  if (!currency || typeof currency !== 'string') {
    currency = 'USD'; // Default currency
  }
  
  try {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
    };
    const symbol = currencySymbols[currency] || currency + ' ';
    return `${symbol}${amount.toFixed(2)}`;
  }
};

