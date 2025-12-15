// Products List Page
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useIapProducts } from '../../hooks/useIapProducts';
import Layout from '../../components/layout/Layout';
import { theme } from '../../styles/theme';
import './ProductList.css';

const ProductList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedCurrency, setSelectedCurrency] = useState('INR'); // Default to INR
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  
  const { categories } = useCategories();
  const { iapProducts } = useIapProducts({ platform: 'All' });
  const navigate = useNavigate();
  
  // Pass category filter to useProducts hook
  const filters = useMemo(() => ({
    categoryId: selectedCategory !== 'All' ? selectedCategory : null,
  }), [selectedCategory]);
  
  const { products, loading, error, hasMore, loadMore, removeProduct } = useProducts(filters);
  const loadMoreButtonRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const previousProductsLengthRef = useRef(0);
  
  // Create IAP lookup map by ID
  const iapLookup = useMemo(() => {
    const lookup = {};
    iapProducts.forEach(iap => {
      lookup[iap.id] = iap;
    });
    return lookup;
  }, [iapProducts]);

  // Restore scroll position after loading more items
  useEffect(() => {
    if (!loading && products.length > previousProductsLengthRef.current && scrollPositionRef.current > 0) {
      // Items were added, restore scroll position
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
        scrollPositionRef.current = 0;
      }, 0);
    }
    previousProductsLengthRef.current = products.length;
  }, [loading, products.length]);

  // Filter products (only search query now, category filtering is done at Firestore level)
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Note: Category filtering is now done at Firestore query level via useProducts hook
    // We only need to filter by search query here

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, searchQuery]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await removeProduct(id);
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

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

  // Get price for a product from IAP or show FREE
  const getProductPrice = (product) => {
    // If product is free, show FREE
    if (product.isFree) {
      return 'FREE';
    }

    // Try to get price from IAP products
    let iapProduct = null;
    if (product.iapProductIdAndroid) {
      iapProduct = iapLookup[product.iapProductIdAndroid];
    } else if (product.iapProductIdIOS) {
      iapProduct = iapLookup[product.iapProductIdIOS];
    }

    if (iapProduct && iapProduct.prices && Array.isArray(iapProduct.prices) && iapProduct.prices.length > 0) {
      // Find price in selected currency
      const priceObj = iapProduct.prices.find(p => p.currency === selectedCurrency);
      if (priceObj && priceObj.formatted) {
        return priceObj.formatted;
      }
      
      // Fallback to first available price
      if (iapProduct.prices[0] && iapProduct.prices[0].formatted) {
        return iapProduct.prices[0].formatted;
      }
    }

    // If no IAP linked, show FREE
    return 'FREE';
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="products-loading">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout title="PRODUCTS">
      <div className="products-page">
        <div className="products-header-actions">
          <button
            className="add-button"
            onClick={() => navigate('/products/new')}
            style={{ backgroundColor: theme.colors.yellowPrimary }}
          >
            + Add New Product
          </button>
        </div>

        <div className="products-main">
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
              Prices will be shown in {selectedCurrency}
            </span>
          </div>
        )}

        {/* Filters and Search */}
        <div className="products-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <div className="view-toggle">
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            Error: {error}
          </div>
        )}

        {/* Products List/Grid */}
        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>No products found.</p>
            <button
              onClick={() => navigate('/products/new')}
              style={{ backgroundColor: theme.colors.yellowPrimary }}
            >
              Create Your First Product
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'products-grid' : 'products-list'}>
            {filteredProducts.map(product => (
              <div key={product.id} className={`product-card ${viewMode}`}>
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title} />
                  ) : (
                    <div className="image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p className="product-description">{product.description}</p>
                  
                  {/* Category and Price Row */}
                  <div className="product-meta">
                    <span className="product-category">{product.category}</span>
                    <span className="product-price" style={{
                      fontWeight: 600,
                      color: product.isFree || (!product.iapProductIdAndroid && !product.iapProductIdIOS) ? '#4CAF50' : '#1A1A1A'
                    }}>
                      {getProductPrice(product)}
                    </span>
                  </div>

                  {/* IAP Information Section */}
                  {(product.iapProductIdAndroid || product.iapProductIdIOS) && (
                    <div className="product-iap-section">
                      <div className="product-iap-badges">
                        <span className="product-iap-badge">
                          {product.iapProductIdAndroid && product.iapProductIdIOS ? 'IAP (Both)' : 
                           product.iapProductIdAndroid ? 'IAP (Android)' : 'IAP (iOS)'}
                        </span>
                      </div>
                      <div className="product-iap-skus">
                        {product.iapProductIdAndroid && iapLookup[product.iapProductIdAndroid] && (
                          <div className="iap-sku-item">
                            <span className="iap-sku-icon">🤖</span>
                            <span className="iap-sku-text">
                              {iapLookup[product.iapProductIdAndroid].sku || product.iapProductIdAndroid}
                            </span>
                          </div>
                        )}
                        {product.iapProductIdIOS && iapLookup[product.iapProductIdIOS] && (
                          <div className="iap-sku-item">
                            <span className="iap-sku-icon">🍎</span>
                            <span className="iap-sku-text">
                              {iapLookup[product.iapProductIdIOS].sku || iapLookup[product.iapProductIdIOS].productId || product.iapProductIdIOS}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="product-actions">
                    <button
                      className="edit-button"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(product.id, product.title)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="products-summary">
          <p>Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}</p>
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

export default ProductList;

