// IAP Product Dropdown Component (Searchable)
import { useState, useRef, useEffect } from 'react';
import './IapProductDropdown.css';

const IapProductDropdown = ({
  label,
  platform,
  iapProducts = [],
  selectedIapProductId,
  onSelect,
  disabled = false,
  error = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Filter IAP products based on search query
  const filteredProducts = iapProducts.filter(product => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.sku?.toLowerCase().includes(query) ||
      product.productId?.toLowerCase().includes(query) ||
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  });

  // Get selected product
  const selectedProduct = iapProducts.find(p => p.id === selectedIapProductId);

  // Get price display
  const getPriceDisplay = (prices) => {
    if (!prices || prices.length === 0) return 'No price';
    const preferred = ['INR', 'USD', 'EUR'];
    for (const currency of preferred) {
      const price = prices.find(p => p.currency === currency);
      if (price) return price.formatted;
    }
    return prices[0]?.formatted || 'No price';
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (product) => {
    onSelect(product.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="iap-dropdown-wrapper" ref={dropdownRef}>
      <label className="iap-dropdown-label">{label}</label>
      <div className={`iap-dropdown ${error ? 'error' : ''} ${disabled ? 'disabled' : ''}`}>
        <div
          className="iap-dropdown-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedProduct ? (
            <div className="iap-dropdown-selected">
              <div className="iap-selected-info">
                <span className="iap-selected-sku">{selectedProduct.sku || selectedProduct.productId}</span>
                <span className="iap-selected-name">{selectedProduct.name || 'N/A'}</span>
                <span className="iap-selected-price">{getPriceDisplay(selectedProduct.prices)}</span>
                <span className={`iap-selected-status ${selectedProduct.status || 'inactive'}`}>
                  {selectedProduct.status || 'N/A'}
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  className="iap-clear-button"
                  onClick={handleClear}
                  title="Clear selection"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <div className="iap-dropdown-placeholder">
              <span>🔍 Search IAP products...</span>
            </div>
          )}
          <span className="iap-dropdown-arrow">▼</span>
        </div>

        {isOpen && (
          <div className="iap-dropdown-menu">
            <div className="iap-dropdown-search">
              <input
                type="text"
                placeholder="Search by SKU, name, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <div className="iap-dropdown-list">
              {filteredProducts.length === 0 ? (
                <div className="iap-dropdown-empty">
                  {searchQuery ? 'No products found' : 'No IAP products available'}
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`iap-dropdown-item ${selectedIapProductId === product.id ? 'selected' : ''}`}
                    onClick={() => handleSelect(product)}
                  >
                    <div className="iap-item-main">
                      <div className="iap-item-sku">{product.sku || product.productId || 'N/A'}</div>
                      <div className="iap-item-name">{product.name || 'N/A'}</div>
                    </div>
                    <div className="iap-item-meta">
                      <span className="iap-item-price">{getPriceDisplay(product.prices)}</span>
                      <span className={`iap-item-status ${product.status || 'inactive'}`}>
                        {product.status || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
      {selectedProduct && (
        <small className="iap-dropdown-hint">
          Selected: {selectedProduct.sku || selectedProduct.productId} - {getPriceDisplay(selectedProduct.prices)}
        </small>
      )}
    </div>
  );
};

export default IapProductDropdown;

