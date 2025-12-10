// Purchase Detail Page
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPurchase } from '../../services/firebase/firestore';
import { useIapProducts } from '../../hooks/useIapProducts';
import Layout from '../../components/layout/Layout';
import { formatPrice, formatDate } from '../../utils/formatters';
import './PurchaseDetail.css';

const PurchaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
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
  
  // Get price for purchase in selected currency
  const getPurchasePrice = (purchase) => {
    if (!purchase.iapProductId) {
      return purchase.productPriceFormatted || formatPrice(purchase.productPrice);
    }
    
    const iapProduct = iapProductLookup[purchase.iapProductId];
    if (!iapProduct || !iapProduct.prices || !Array.isArray(iapProduct.prices)) {
      return purchase.productPriceFormatted || formatPrice(purchase.productPrice);
    }
    
    const priceObj = iapProduct.prices.find(p => p.currency === selectedCurrency);
    if (priceObj && priceObj.formatted) {
      return priceObj.formatted;
    }
    
    if (iapProduct.prices.length > 0 && iapProduct.prices[0].formatted) {
      return iapProduct.prices[0].formatted;
    }
    
    return purchase.productPriceFormatted || formatPrice(purchase.productPrice);
  };

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const fetchPurchase = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getPurchase(id);
      if (data) {
        setPurchase(data);
      } else {
        setError('Purchase not found');
      }
    } catch (err) {
      console.error('Error fetching purchase:', err);
      setError(err.message || 'Failed to load purchase');
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
      <Layout title="PURCHASE DETAILS" showBack={true} backPath="/purchases">
        <div className="purchase-detail-page">
          <div className="purchase-detail-loading">
            <p>Loading purchase details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !purchase) {
    return (
      <Layout title="PURCHASE DETAILS" showBack={true} backPath="/purchases">
        <div className="purchase-detail-page">
          <div className="error-banner">{error}</div>
          <button onClick={() => navigate('/purchases')} className="back-button">
            Back to Purchases
          </button>
        </div>
      </Layout>
    );
  }

  if (!purchase) {
    return (
      <Layout title="PURCHASE DETAILS" showBack={true} backPath="/purchases">
        <div className="purchase-detail-page">
          <div className="error-banner">Purchase not found</div>
          <button onClick={() => navigate('/purchases')} className="back-button">
            Back to Purchases
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="PURCHASE DETAILS" showBack={true} backPath="/purchases">
      <div className="purchase-detail-page">
        <div className="purchase-detail-main">
          {error && (
            <div className="error-banner">
              Error: {error}
            </div>
          )}

          <div className="purchase-detail-container">
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
              </div>
            )}

            {/* Header Section */}
            <div className="purchase-detail-header">
              <div className="purchase-detail-title">
                <h1>Purchase Details</h1>
                <span className={`status-badge ${getStatusBadgeClass(purchase.status)}`}>
                  {purchase.status || 'N/A'}
                </span>
              </div>
              <div className="purchase-detail-id">
                <strong>Transaction ID:</strong> <code>{purchase.transactionId || 'N/A'}</code>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="purchase-detail-grid">
              {/* Left Column - Product Info */}
              <div className="purchase-detail-section">
                <h2>Product Information</h2>
                <div className="purchase-detail-card">
                  {purchase.productImageUrl && (
                    <div className="product-image-large">
                      <img src={purchase.productImageUrl} alt={purchase.productTitle} />
                    </div>
                  )}
                  <div className="product-info">
                    <h3>{purchase.productTitle || 'N/A'}</h3>
                    {purchase.productCategory && (
                      <p className="product-category">Category: {purchase.productCategory}</p>
                    )}
                    <div className="product-price-large">
                      {getPurchasePrice(purchase)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - User & Purchase Info */}
              <div className="purchase-detail-section">
                <h2>User Information</h2>
                <div className="purchase-detail-card">
                  <div className="info-row">
                    <strong>Email:</strong>
                    <span>{purchase.userEmail || 'N/A'}</span>
                  </div>
                  {purchase.userId && (
                    <div className="info-row">
                      <strong>User ID:</strong>
                      <code>{purchase.userId}</code>
                    </div>
                  )}
                </div>

                <h2 style={{ marginTop: '24px' }}>Purchase Information</h2>
                <div className="purchase-detail-card">
                  <div className="info-row">
                    <strong>Purchase Date:</strong>
                    <span>{formatDate(purchase.purchaseDate)}</span>
                  </div>
                  {purchase.licenseeName && (
                    <div className="info-row">
                      <strong>Licensee Name:</strong>
                      <span style={{ 
                        fontWeight: 600, 
                        color: '#FFA500',
                        fontSize: '16px'
                      }}>
                        {purchase.licenseeName}
                      </span>
                    </div>
                  )}
                  <div className="info-row">
                    <strong>Platform:</strong>
                    <span>
                      <span className="platform-icon">{getPlatformIcon(purchase.platform)}</span>
                      {purchase.platform || 'N/A'}
                    </span>
                  </div>
                  <div className="info-row">
                    <strong>Status:</strong>
                    <span className={`status-badge ${getStatusBadgeClass(purchase.status)}`}>
                      {purchase.status || 'N/A'}
                    </span>
                  </div>
                  {purchase.refundDate && (
                    <div className="info-row">
                      <strong>Refund Date:</strong>
                      <span>{formatDate(purchase.refundDate)}</span>
                    </div>
                  )}
                  {purchase.refundReason && (
                    <div className="info-row">
                      <strong>Refund Reason:</strong>
                      <span>{purchase.refundReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* IAP Receipt Section (if available) */}
            {purchase.iapReceipt && (
              <div className="purchase-detail-section">
                <h2>IAP Receipt</h2>
                <div className="purchase-detail-card">
                  <pre className="iap-receipt">
                    {typeof purchase.iapReceipt === 'string' 
                      ? purchase.iapReceipt 
                      : JSON.stringify(purchase.iapReceipt, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="purchase-detail-actions">
              <button
                onClick={() => navigate('/purchases')}
                className="back-button"
              >
                ← Back to Purchases
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PurchaseDetail;

