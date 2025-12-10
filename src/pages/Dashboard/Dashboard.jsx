// Dashboard Page
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useIapProducts } from '../../hooks/useIapProducts';
import { usePurchases } from '../../hooks/usePurchases';
import Layout from '../../components/layout/Layout';
import { formatPrice } from '../../utils/formatters';
import { theme } from '../../styles/theme';
import './Dashboard.css';

const Dashboard = () => {
  const { authError } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState('INR');
  
  const { iapProducts } = useIapProducts({ platform: 'All' });
  const { purchases } = usePurchases({});
  
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
    if (!purchase.iapProductId) {
      return purchase.productPrice || 0;
    }
    
    const iapProduct = iapProductLookup[purchase.iapProductId];
    if (!iapProduct || !iapProduct.prices || !Array.isArray(iapProduct.prices)) {
      return purchase.productPrice || 0;
    }
    
    const priceObj = iapProduct.prices.find(p => p.currency === selectedCurrency);
    if (priceObj && priceObj.amount) {
      return priceObj.amount;
    }
    
    // Fallback to first available price
    if (iapProduct.prices.length > 0 && iapProduct.prices[0].amount) {
      return iapProduct.prices[0].amount;
    }
    
    return purchase.productPrice || 0;
  };
  
  // Calculate revenue in selected currency
  const revenueInCurrency = useMemo(() => {
    if (!purchases || purchases.length === 0) return 0;
    
    const completedPurchases = purchases.filter(p => p.status === 'completed');
    return completedPurchases.reduce((sum, p) => {
      return sum + getPurchasePriceAmount(p);
    }, 0);
  }, [purchases, iapProductLookup, selectedCurrency]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics. Please check Firestore connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <Layout title="DASHBOARD">
        <div className="dashboard-loading">
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="DASHBOARD">
      <div className="dashboard">
        {authError && (
          <div className="dashboard-warning" style={{ marginBottom: '24px', padding: '12px', background: '#FFF3CD', border: '1px solid #FFC107', borderRadius: '8px', color: '#856404' }}>
            ⚠️ {authError}
          </div>
        )}

        <div className="dashboard-content">
          {error && (
            <div className="dashboard-error" style={{ marginBottom: '24px', padding: '12px', background: '#FFEBEE', border: '1px solid #E53935', borderRadius: '8px', color: '#C62828' }}>
              {error}
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
              Revenue will be shown in {selectedCurrency}
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Products</div>
              <div className="stat-value">{stats?.totalProducts || 0}</div>
              <div className="stat-subtext">{stats?.activeProducts || 0} active</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total Categories</div>
              <div className="stat-value">{stats?.totalCategories || 0}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total Users</div>
              <div className="stat-value">{stats?.totalUsers || 0}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total Purchases</div>
              <div className="stat-value">{stats?.totalPurchases || 0}</div>
            </div>

            <div className="stat-card stat-card-highlight">
              <div className="stat-label">Total Revenue ({selectedCurrency})</div>
              <div className="stat-value">
                {formatPrice(revenueInCurrency, `${selectedCurrency} ${revenueInCurrency.toFixed(2)}`)}
              </div>
            </div>
          </div>

          <div className="dashboard-welcome">
            <h2>Welcome to AssetDoor Admin Panel</h2>
            <p>Manage your digital goods store from here.</p>
            
            <div className="quick-actions">
              <button
                onClick={() => navigate('/products')}
                className="action-button"
                style={{ backgroundColor: theme.colors.yellowPrimary }}
              >
                Manage Products
              </button>
              <button
                onClick={() => navigate('/categories')}
                className="action-button"
                style={{ backgroundColor: theme.colors.yellowPrimary }}
              >
                Manage Categories
              </button>
              <button
                onClick={() => navigate('/purchases')}
                className="action-button"
                style={{ backgroundColor: theme.colors.yellowPrimary }}
              >
                View Purchases
              </button>
              <button
                onClick={() => navigate('/users')}
                className="action-button"
                style={{ backgroundColor: theme.colors.yellowPrimary }}
              >
                View Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
