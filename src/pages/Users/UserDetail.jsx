// User Detail Page
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUser, getUserPurchases } from '../../services/firebase/firestore';
import { useIapProducts } from '../../hooks/useIapProducts';
import Layout from '../../components/layout/Layout';
import { formatPrice, formatDate, formatAmountInCurrency } from '../../utils/formatters';
import './UserDetail.css';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  
  const { iapProducts } = useIapProducts({ platform: 'All' });
  
  // Create IAP product lookup map
  const iapProductLookup = useMemo(() => {
    const lookup = {};
    iapProducts.forEach(iap => {
      lookup[iap.id] = iap;
    });
    return lookup;
  }, [iapProducts]);
  
  // Get available currencies
  const availableCurrencies = useMemo(() => {
    const currencies = new Set();
    iapProducts.forEach(iap => {
      if (iap.prices && Array.isArray(iap.prices)) {
        iap.prices.forEach(price => {
          if (price.currency) {
            currencies.add(price.currency);
          }
        });
      }
    });
    ['USD', 'INR', 'EUR'].forEach(c => currencies.add(c));
    return Array.from(currencies).sort();
  }, [iapProducts]);
  
  // Get price amount for a purchase in selected currency
  const getPurchasePriceAmount = (purchase) => {
    // Always try to get price from IAP products first (never use product collection price)
    if (!purchase.iapProductId) {
      // No IAP product ID - return 0 (FREE)
      return 0;
    }
    
    const iapProduct = iapProductLookup[purchase.iapProductId];
    if (!iapProduct || !iapProduct.prices || !Array.isArray(iapProduct.prices) || iapProduct.prices.length === 0) {
      // IAP product not found or has no prices - return 0 (FREE)
      return 0;
    }
    
    // Find price in selected currency (preferred)
    const priceObj = iapProduct.prices.find(p => p.currency === selectedCurrency);
    if (priceObj && priceObj.amount !== undefined && priceObj.amount !== null) {
      return priceObj.amount;
    }
    
    // If selected currency not available, try preferred order: INR, USD, EUR, then first available
    const preferredCurrencies = ['INR', 'USD', 'EUR'];
    for (const currency of preferredCurrencies) {
      const preferredPrice = iapProduct.prices.find(p => p.currency === currency);
      if (preferredPrice && preferredPrice.amount !== undefined && preferredPrice.amount !== null) {
        return preferredPrice.amount;
      }
    }
    
    // Last resort: use first available price amount
    if (iapProduct.prices.length > 0 && iapProduct.prices[0].amount !== undefined && iapProduct.prices[0].amount !== null) {
      return iapProduct.prices[0].amount;
    }
    
    // Should never reach here, but return 0 (FREE)
    return 0;
  };
  
  // Get price for a purchase in selected currency (formatted)
  const getPurchasePrice = (purchase) => {
    // Always try to get price from IAP products first (never use product collection price)
    if (!purchase.iapProductId) {
      // No IAP product ID - show FREE
      return 'FREE';
    }
    
    const iapProduct = iapProductLookup[purchase.iapProductId];
    if (!iapProduct || !iapProduct.prices || !Array.isArray(iapProduct.prices) || iapProduct.prices.length === 0) {
      // IAP product not found or has no prices - show FREE
      return 'FREE';
    }
    
    // Find price in selected currency (preferred)
    const priceObj = iapProduct.prices.find(p => p.currency === selectedCurrency);
    if (priceObj) {
      // If we have the selected currency, use its formatted price
      if (priceObj.formatted) {
        return priceObj.formatted;
      }
      // If formatted is missing but amount exists, format it in selected currency
      if (priceObj.amount !== undefined && priceObj.amount !== null) {
        return formatAmountInCurrency(priceObj.amount, selectedCurrency);
      }
    }
    
    // Selected currency not available - get amount from any available price and format in selected currency
    // Try preferred order: INR, USD, EUR, then first available
    const preferredCurrencies = ['INR', 'USD', 'EUR'];
    for (const currency of preferredCurrencies) {
      const preferredPrice = iapProduct.prices.find(p => p.currency === currency);
      if (preferredPrice && preferredPrice.amount !== undefined && preferredPrice.amount !== null) {
        // Format the amount in the selected currency
        return formatAmountInCurrency(preferredPrice.amount, selectedCurrency);
      }
    }
    
    // Last resort: use first available price amount and format in selected currency
    if (iapProduct.prices.length > 0) {
      const firstPrice = iapProduct.prices[0];
      if (firstPrice.amount !== undefined && firstPrice.amount !== null) {
        return formatAmountInCurrency(firstPrice.amount, selectedCurrency);
      }
      // If only formatted exists, try to extract amount and format
      if (firstPrice.formatted) {
        // Try to extract numeric value from formatted string
        const match = firstPrice.formatted.match(/[\d,]+\.?\d*/);
        if (match) {
          const amount = parseFloat(match[0].replace(/,/g, ''));
          return formatAmountInCurrency(amount, selectedCurrency);
        }
      }
    }
    
    // Should never reach here, but show FREE as fallback
    return 'FREE';
  };
  
  // Calculate total spent in selected currency
  const totalSpentInCurrency = useMemo(() => {
    if (!purchases || purchases.length === 0) return 0;
    
    const completedPurchases = purchases.filter(p => p.status === 'completed');
    return completedPurchases.reduce((sum, p) => {
      return sum + getPurchasePriceAmount(p);
    }, 0);
  }, [purchases, iapProductLookup, selectedCurrency]);

  // Calculate actual purchase count from fetched purchases
  const totalPurchasesCount = useMemo(() => {
    return purchases ? purchases.length : 0;
  }, [purchases]);

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch user data
      const userData = await getUser(id);
      if (!userData) {
        setError('User not found');
        setLoading(false);
        return;
      }
      setUser(userData);
      
      // Fetch user purchases
      const purchasesData = await getUserPurchases(id);
      setPurchases(purchasesData);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'refunded':
        return 'status-refunded';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  const getPlatformIcon = (platform) => {
    return platform === 'ios' ? '🍎' : platform === 'android' ? '🤖' : '📱';
  };

  if (loading) {
    return (
      <Layout title="USER DETAILS" showBack={true} backPath="/users">
        <div className="user-detail-page">
          <div className="user-detail-loading">
            <p>Loading user details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !user) {
    return (
      <Layout title="USER DETAILS" showBack={true} backPath="/users">
        <div className="user-detail-page">
          <div className="error-banner">{error}</div>
          <button onClick={() => navigate('/users')} className="back-button">
            Back to Users
          </button>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout title="USER DETAILS" showBack={true} backPath="/users">
        <div className="user-detail-page">
          <div className="error-banner">User not found</div>
          <button onClick={() => navigate('/users')} className="back-button">
            Back to Users
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="USER DETAILS" showBack={true} backPath="/users">
      <div className="user-detail-page">
        <div className="user-detail-main">
          {error && (
            <div className="error-banner">
              Error: {error}
            </div>
          )}

          <div className="user-detail-container">
            {/* Header Section */}
            <div className="user-detail-header">
              <div className="user-detail-avatar-section">
                <div className="user-avatar-large">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="user-detail-title">
                  <h1>{user.displayName || 'No Name'}</h1>
                  <p className="user-email-large">{user.email || 'N/A'}</p>
                  <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Currency Selector */}
            {availableCurrencies.length > 0 && (
              <div style={{ 
                marginBottom: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '16px',
                background: '#FAFAFA',
                borderRadius: '8px',
                border: '1px solid #E0E0E0'
              }}>
                <label style={{ fontWeight: 600, fontSize: '14px', color: '#1A1A1A' }}>
                  Display Currency:
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #E0E0E0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    minWidth: '120px'
                  }}
                >
                  {availableCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Spending will be shown in {selectedCurrency}
                </span>
              </div>
            )}

            {/* Stats Section */}
            <div className="user-stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Purchases</div>
                <div className="stat-value">{totalPurchasesCount}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Spent ({selectedCurrency})</div>
                <div className="stat-value">
                  {formatAmountInCurrency(totalSpentInCurrency, selectedCurrency)}
                </div>
              </div>
            </div>

            {/* Purchases Section */}
            <div className="user-purchases-section">
              <h2>Purchase History</h2>
              {purchases.length === 0 ? (
                <div className="empty-state">
                  <p>No purchases found for this user.</p>
                </div>
              ) : (
                <div className="purchases-table-container">
                  <table className="purchases-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Licensee Name</th>
                        <th>Price</th>
                        <th>Platform</th>
                        <th>Status</th>
                        <th>Transaction ID</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map(purchase => (
                        <tr key={purchase.id}>
                          <td>{formatDate(purchase.purchaseDate)}</td>
                          <td>
                            <div className="product-cell">
                              {purchase.productImageUrl && (
                                <img src={purchase.productImageUrl} alt={purchase.productTitle} className="product-thumb" />
                              )}
                              <span>{purchase.productTitle || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="licensee-cell">
                            {purchase.licenseeName ? (
                              <span style={{ 
                                fontWeight: 600, 
                                color: '#FFA500',
                                fontSize: '14px'
                              }}>
                                {purchase.licenseeName}
                              </span>
                            ) : (
                              <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                            )}
                          </td>
                          <td className="price-cell">{getPurchasePrice(purchase)}</td>
                          <td className="platform-cell">
                            <span className="platform-icon">{getPlatformIcon(purchase.platform)}</span>
                            <span>{purchase.platform || 'N/A'}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(purchase.status)}`}>
                              {purchase.status || 'N/A'}
                            </span>
                          </td>
                          <td className="transaction-cell">
                            <code>{purchase.transactionId || 'N/A'}</code>
                          </td>
                          <td>
                            <button
                              className="view-button"
                              onClick={() => navigate(`/purchases/${purchase.id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="user-detail-actions">
              <button
                onClick={() => navigate('/users')}
                className="back-button"
              >
                ← Back to Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDetail;

