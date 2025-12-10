// IAP Products List Page
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIapProducts } from '../../hooks/useIapProducts';
import { useProducts } from '../../hooks/useProducts';
import Layout from '../../components/layout/Layout';
import { theme } from '../../styles/theme';
import { formatDate } from '../../utils/formatters';
import './IapProductList.css';

const IapProductList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [linkedFilter, setLinkedFilter] = useState('All');
  const [syncing, setSyncing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  
  const { iapProducts, loading, error, hasMore, loadMore, syncStatus, refetch, triggerManualSync } = useIapProducts({
    platform: platformFilter,
  });
  const loadMoreButtonRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const previousIapProductsLengthRef = useRef(0);

  // Restore scroll position after loading more items
  useEffect(() => {
    if (!loading && iapProducts.length > previousIapProductsLengthRef.current && scrollPositionRef.current > 0) {
      // Items were added, restore scroll position
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
        scrollPositionRef.current = 0;
      }, 0);
    }
    previousIapProductsLengthRef.current = iapProducts.length;
  }, [loading, iapProducts.length]);
  
  const { products } = useProducts();
  
  // Create product lookup map by ID
  const productLookup = useMemo(() => {
    const lookup = {};
    products.forEach(product => {
      lookup[product.id] = product;
    });
    return lookup;
  }, [products]);
  
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
    ['USD', 'INR', 'EUR'].forEach(c => currencies.add(c));
    return Array.from(currencies).sort();
  }, [iapProducts]);

  // Filter IAP products
  const filteredIapProducts = useMemo(() => {
    let filtered = [...iapProducts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.sku?.toLowerCase().includes(query) ||
        p.productId?.toLowerCase().includes(query) ||
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filter by linked status
    if (linkedFilter !== 'All') {
      if (linkedFilter === 'Linked') {
        filtered = filtered.filter(p => p.isLinked === true);
      } else if (linkedFilter === 'Not Linked') {
        filtered = filtered.filter(p => !p.isLinked);
      }
    }

    return filtered;
  }, [iapProducts, searchQuery, statusFilter, linkedFilter]);

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      await triggerManualSync();
      alert('Sync triggered successfully! Data will refresh in a few seconds.');
    } catch (err) {
      alert('Failed to trigger sync: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  const getPlatformBadge = (platform) => {
    if (platform === 'android') {
      return <span className="platform-badge android">🤖 Android</span>;
    } else if (platform === 'ios') {
      return <span className="platform-badge ios">🍎 iOS</span>;
    }
    return <span className="platform-badge">{platform || 'N/A'}</span>;
  };

  const getStatusBadge = (status) => {
    const statusClass = status === 'active' ? 'status-active' : 'status-inactive';
    return <span className={`status-badge ${statusClass}`}>{status || 'N/A'}</span>;
  };

  const formatLastSynced = (timestamp) => {
    if (!timestamp) return 'Never';
    if (timestamp.toDate) {
      return formatDate(timestamp.toDate());
    }
    if (timestamp instanceof Date) {
      return formatDate(timestamp);
    }
    if (typeof timestamp === 'number') {
      return formatDate(new Date(timestamp));
    }
    return 'Never';
  };

  const getErrorMessage = (error) => {
    if (!error) return 'Unknown error';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    if (error.toString && typeof error.toString === 'function') {
      try {
        return error.toString();
      } catch (e) {
        return 'Error occurred';
      }
    }
    try {
      return JSON.stringify(error);
    } catch (e) {
      return 'Error occurred';
    }
  };

  const getPriceDisplay = (prices) => {
    if (!prices || !Array.isArray(prices) || prices.length === 0) return 'No price';
    
    // Show price in selected currency
    const price = prices.find(p => p && p.currency === selectedCurrency);
    if (price && price.formatted) {
      return price.formatted;
    }
    
    // Fallback to first available price
    if (prices[0] && prices[0].formatted) {
      return prices[0].formatted;
    }
    
    return 'No price';
  };

  if (loading) {
    return (
      <Layout title="IAP PRODUCTS">
        <div className="iap-products-page">
          <div className="iap-products-loading">
            <p>Loading IAP products...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="IAP PRODUCTS">
      <div className="iap-products-page">
        <div className="iap-products-main">
          {error && (
            <div className="error-banner">
              Error: {error}
            </div>
          )}

          {/* Header Actions */}
          <div className="iap-products-header-actions">
            <button
              className="sync-button"
              onClick={handleManualSync}
              disabled={syncing}
              style={{ backgroundColor: theme.colors.yellowPrimary }}
            >
              {syncing ? 'Syncing...' : '🔄 Sync Now'}
            </button>
            <button
              className="refresh-button"
              onClick={refetch}
            >
              ↻ Refresh
            </button>
          </div>

          {/* Sync Status */}
          {syncStatus && (
            <div className="sync-status-banner">
              <div className="sync-status-info">
                <span>Last Sync: {formatLastSynced(syncStatus.lastSync || syncStatus.lastSyncedAt || null)}</span>
                {syncStatus.success === false && syncStatus.error && (
                  <span className="sync-error">
                    Error: {getErrorMessage(syncStatus.error)}
                  </span>
                )}
                {syncStatus.success === true && (
                  <span className="sync-success">✓ Sync successful</span>
                )}
              </div>
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
              Prices will be shown in {selectedCurrency}
            </span>
          </div>

          {/* Filters */}
          <div className="iap-products-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by SKU, Product ID, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Platform</label>
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Platforms</option>
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Linked</label>
                <select
                  value={linkedFilter}
                  onChange={(e) => setLinkedFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All</option>
                  <option value="Linked">Linked</option>
                  <option value="Not Linked">Not Linked</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSearchQuery('');
                  setPlatformFilter('All');
                  setStatusFilter('All');
                  setLinkedFilter('All');
                }}
                className="clear-filters-button"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* IAP Products Table */}
          {filteredIapProducts.length === 0 ? (
            <div className="empty-state">
              <p>No IAP products found.</p>
              <p className="empty-state-hint">
                {iapProducts.length === 0 
                  ? 'IAP products will appear here after syncing from Google Play Console.'
                  : 'Try adjusting your filters.'}
              </p>
            </div>
          ) : (
            <div className="iap-products-table-container">
              <table className="iap-products-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>SKU / Product ID</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Linked</th>
                    <th>Linked Product</th>
                    <th>Last Synced</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIapProducts.map(product => (
                    <tr key={product.id}>
                      <td>{getPlatformBadge(product.platform)}</td>
                      <td className="sku-cell">
                        <code>{product.sku || product.productId || 'N/A'}</code>
                      </td>
                      <td>
                        <div className="product-name-cell">
                          <div className="product-name">{product.name || 'N/A'}</div>
                          {product.description && (
                            <div className="product-description">{product.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="price-cell">
                        {getPriceDisplay(product.prices)}
                        {product.prices && Array.isArray(product.prices) && product.prices.length > 1 && (
                          <div className="price-hint">+{product.prices.length - 1} more</div>
                        )}
                      </td>
                      <td>{getStatusBadge(product.status)}</td>
                      <td>
                        {product.isLinked ? (
                          <span className="linked-badge linked">✓ Linked</span>
                        ) : (
                          <span className="linked-badge not-linked">Not Linked</span>
                        )}
                      </td>
                      <td className="linked-product-cell">
                        {product.linkedProductId ? (
                          productLookup[product.linkedProductId] ? (
                            <div className="linked-product-info">
                              <span 
                                className="linked-product-link"
                                onClick={() => navigate(`/products/${product.linkedProductId}/edit`)}
                                style={{ 
                                  cursor: 'pointer',
                                  color: theme.colors.primary,
                                  textDecoration: 'underline',
                                  fontWeight: 'bold'
                                }}
                              >
                                {productLookup[product.linkedProductId].title}
                              </span>
                              <span className="linked-product-id" style={{ 
                                fontSize: '12px',
                                color: '#666',
                                marginLeft: '8px'
                              }}>
                                (ID: {product.linkedProductId.substring(0, 8)}...)
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>
                              Product not found (ID: {product.linkedProductId.substring(0, 8)}...)
                            </span>
                          )
                        ) : (
                          <span style={{ color: '#999' }}>—</span>
                        )}
                      </td>
                      <td className="synced-cell">
                        {formatLastSynced(product.lastSynced)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="iap-products-summary">
            <p>Showing {filteredIapProducts.length} IAP product{filteredIapProducts.length !== 1 ? 's' : ''}</p>
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

export default IapProductList;

