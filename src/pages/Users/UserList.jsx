// Users List Page
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { usePurchases } from '../../hooks/usePurchases';
import { useIapProducts } from '../../hooks/useIapProducts';
import Layout from '../../components/Layout/Layout';
import { formatPrice, formatDate } from '../../utils/formatters';
import './UserList.css';

const UserList = () => {
  const { users, loading, error, hasMore, loadMore } = useUsers();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const loadMoreButtonRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const previousUsersLengthRef = useRef(0);
  
  const { purchases } = usePurchases({});
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
  
  // Calculate user spending in selected currency
  const userSpendingMap = useMemo(() => {
    const spendingMap = {};
    if (!purchases || purchases.length === 0) return spendingMap;
    
    const completedPurchases = purchases.filter(p => p.status === 'completed');
    completedPurchases.forEach(purchase => {
      const userId = purchase.userId;
      if (!userId) return;
      
      if (!spendingMap[userId]) {
        spendingMap[userId] = 0;
      }
      spendingMap[userId] += getPurchasePriceAmount(purchase);
    });
    
    return spendingMap;
  }, [purchases, iapProductLookup, selectedCurrency]);

  // Restore scroll position after loading more items
  useEffect(() => {
    if (!loading && users.length > previousUsersLengthRef.current && scrollPositionRef.current > 0) {
      // Items were added, restore scroll position
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
        scrollPositionRef.current = 0;
      }, 0);
    }
    previousUsersLengthRef.current = users.length;
  }, [loading, users.length]);

  // Filter users
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by status
    if (statusFilter !== 'All') {
      const isActive = statusFilter === 'Active';
      filtered = filtered.filter(u => (u.isActive !== false) === isActive);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.email?.toLowerCase().includes(query) ||
        u.displayName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, statusFilter, searchQuery]);

  // Calculate summary
  const summary = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive !== false).length;
    const usersWithPurchases = users.filter(u => (u.totalPurchases || 0) > 0).length;
    
    // Calculate total revenue in selected currency
    const totalRevenue = Object.values(userSpendingMap).reduce((sum, spent) => sum + spent, 0);

    return {
      totalUsers,
      activeUsers,
      usersWithPurchases,
      totalRevenue,
    };
  }, [users, userSpendingMap]);

  if (loading) {
    return (
      <Layout title="USERS">
        <div className="users-page">
          <div className="users-loading">
            <p>Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="USERS">
      <div className="users-page">
        <div className="users-main">
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
            Spending and revenue will be shown in {selectedCurrency}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <div className="summary-label">Total Users</div>
            <div className="summary-value">{summary.totalUsers}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Active Users</div>
            <div className="summary-value">{summary.activeUsers}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Users with Purchases</div>
            <div className="summary-value">{summary.usersWithPurchases}</div>
          </div>
          <div className="summary-card summary-card-highlight">
            <div className="summary-label">Total Revenue ({selectedCurrency})</div>
            <div className="summary-value">
              {formatPrice(summary.totalRevenue, `${selectedCurrency} ${summary.totalRevenue.toFixed(2)}`)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="users-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="clear-filters-button"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        ) : (
          <div className="users-list">
            {filteredUsers.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div className="user-info">
                  <h3>{user.displayName || 'No Name'}</h3>
                  <p className="user-email">{user.email || 'N/A'}</p>
                  <div className="user-meta">
                    <span className="meta-item">
                      <strong>Purchases:</strong> {user.totalPurchases || 0}
                    </span>
                    <span className="meta-item">
                      <strong>Spent:</strong> {formatPrice(userSpendingMap[user.id] || 0, `${selectedCurrency} ${(userSpendingMap[user.id] || 0).toFixed(2)}`)}
                    </span>
                    <span className="meta-item">
                      <strong>Joined:</strong> {formatDate(user.createdAt)}
                    </span>
                    {user.lastLogin && (
                      <span className="meta-item">
                        <strong>Last Login:</strong> {formatDate(user.lastLogin)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="user-status">
                  <span className={`status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                    {user.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="user-actions">
                  <button
                    className="view-button"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="users-summary">
          <p>Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</p>
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

export default UserList;

