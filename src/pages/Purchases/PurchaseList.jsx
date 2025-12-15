// Purchases List Page
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases } from '../../hooks/usePurchases';
import { useIapProducts } from '../../hooks/useIapProducts';
import Layout from '../../components/layout/Layout';
import { formatPrice, formatDate, formatAmountInCurrency } from '../../utils/formatters';
import './PurchaseList.css';

const PurchaseList = () => {
  const [filters, setFilters] = useState({
    status: 'All',
    startDate: '',
    endDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('INR'); // Default to INR
  
  const { purchases, loading, error, hasMore, loadMore } = usePurchases(filters);
  const loadMoreButtonRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const previousPurchasesLengthRef = useRef(0);

  // Restore scroll position after loading more items
  useEffect(() => {
    if (!loading && purchases.length > previousPurchasesLengthRef.current && scrollPositionRef.current > 0) {
      // Items were added, restore scroll position
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
        scrollPositionRef.current = 0;
      }, 0);
    }
    previousPurchasesLengthRef.current = purchases.length;
  }, [loading, purchases.length]);
  const { iapProducts } = useIapProducts({ platform: 'All' });
  const navigate = useNavigate();
  
  // Create IAP product lookup map by ID (SKU/productId)
  const iapProductLookup = useMemo(() => {
    const lookup = {};
    iapProducts.forEach(iap => {
      lookup[iap.id] = iap;
    });
    return lookup;
  }, [iapProducts]);
  
  // Get available currencies from IAP products
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
    // Always include common currencies
    ['USD', 'INR', 'EUR'].forEach(c => currencies.add(c));
    return Array.from(currencies).sort();
  }, [iapProducts]);
  
  // Get price for a purchase in selected currency
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
  
  // Get price amount (numeric) for a purchase in selected currency
  const getPurchasePriceAmount = (purchase) => {
    // Always try to get price from IAP products first (never use product collection price)
    if (!purchase.iapProductId) {
      return 0; // No IAP product = FREE
    }
    
    const iapProduct = iapProductLookup[purchase.iapProductId];
    if (!iapProduct || !iapProduct.prices || !Array.isArray(iapProduct.prices) || iapProduct.prices.length === 0) {
      return 0; // No IAP prices = FREE
    }
    
    // Find price in selected currency (preferred)
    const priceObj = iapProduct.prices.find(p => p.currency === selectedCurrency);
    if (priceObj && priceObj.amount) {
      return priceObj.amount;
    }
    
    // If selected currency not available, try preferred order: INR, USD, EUR, then first available
    const preferredCurrencies = ['INR', 'USD', 'EUR'];
    for (const currency of preferredCurrencies) {
      const preferredPrice = iapProduct.prices.find(p => p.currency === currency);
      if (preferredPrice && preferredPrice.amount) {
        return preferredPrice.amount;
      }
    }
    
    // Last resort: use first available price from IAP
    if (iapProduct.prices.length > 0 && iapProduct.prices[0].amount) {
      return iapProduct.prices[0].amount;
    }
    
    return 0; // Should never reach here, but return 0
  };

  // Filter purchases by search query
  const filteredPurchases = useMemo(() => {
    if (!searchQuery.trim()) return purchases;

    const query = searchQuery.toLowerCase();
    return purchases.filter(p => 
      p.transactionId?.toLowerCase().includes(query) ||
      p.productTitle?.toLowerCase().includes(query) ||
      p.userEmail?.toLowerCase().includes(query)
    );
  }, [purchases, searchQuery]);

  const handleDateRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: status === 'All' ? 'All' : status,
    }));
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

  // Calculate summary stats in selected currency
  const summary = useMemo(() => {
    const filtered = filteredPurchases.filter(p => p.status === 'completed');
    
    // Calculate totals in selected currency
    const totalRevenue = filtered.reduce((sum, p) => {
      return sum + getPurchasePriceAmount(p);
    }, 0);
    
    const avgOrderValue = filtered.length > 0 ? totalRevenue / filtered.length : 0;

    return {
      totalPurchases: filteredPurchases.length,
      completedPurchases: filtered.length,
      totalRevenue,
      avgOrderValue,
    };
  }, [filteredPurchases, iapProductLookup, selectedCurrency]);

  if (loading) {
    return (
      <Layout title="PURCHASES">
        <div className="purchases-page">
          <div className="purchases-loading">
            <p>Loading purchases...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="PURCHASES">
      <div className="purchases-page">
        <div className="purchases-main">
        {error && (
          <div className="error-banner">
            Error: {error}
          </div>
        )}

        {/* Currency Selector */}
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
            All prices and revenue will be shown in {selectedCurrency}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Total Purchases</div>
            <div className="summary-value">{summary.totalPurchases}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Completed</div>
            <div className="summary-value">{summary.completedPurchases}</div>
          </div>
          <div className="summary-card summary-card-highlight">
            <div className="summary-label">Total Revenue ({selectedCurrency})</div>
            <div className="summary-value">
              {formatPrice(summary.totalRevenue, `${selectedCurrency} ${summary.totalRevenue.toFixed(2)}`)}
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Order Value ({selectedCurrency})</div>
            <div className="summary-value">
              {formatPrice(summary.avgOrderValue, `${selectedCurrency} ${summary.avgOrderValue.toFixed(2)}`)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="purchases-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by transaction ID, product, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="completed">Completed</option>
                <option value="refunded">Refunded</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="filter-input"
              />
            </div>

            <button
              onClick={() => {
                setFilters({ status: 'All', startDate: '', endDate: '' });
                setSearchQuery('');
              }}
              className="clear-filters-button"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Purchases Table */}
        {filteredPurchases.length === 0 ? (
          <div className="empty-state">
            <p>No purchases found.</p>
          </div>
        ) : (
          <div className="purchases-table-container">
            <table className="purchases-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
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
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{formatDate(purchase.purchaseDate)}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-email">{purchase.userEmail || 'N/A'}</div>
                      </div>
                    </td>
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
                    <td className="price-cell">
                      {getPurchasePrice(purchase)}
                    </td>
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

        <div className="purchases-summary">
          <p>Showing {filteredPurchases.length} purchase{filteredPurchases.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Pagination */}
        {hasMore && (
          <div className="pagination-container">
            <button
              ref={loadMoreButtonRef}
              onClick={() => {
                // Store scroll position before loading
                if (loadMoreButtonRef.current) {
                  const buttonPosition = loadMoreButtonRef.current.getBoundingClientRect().top + window.scrollY;
                  scrollPositionRef.current = buttonPosition;
                }
                loadMore();
              }}
              disabled={loading}
              className="load-more-button"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};

export default PurchaseList;

