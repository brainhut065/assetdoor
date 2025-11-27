// Purchases List Page
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePurchases } from '../../hooks/usePurchases';
import Layout from '../../components/Layout/Layout';
import { formatPrice, formatDate } from '../../utils/formatters';
import './PurchaseList.css';

const PurchaseList = () => {
  const [filters, setFilters] = useState({
    status: 'All',
    startDate: '',
    endDate: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const { purchases, loading, error } = usePurchases(filters);
  const navigate = useNavigate();

  // Filter purchases by search query
  const filteredPurchases = useMemo(() => {
    if (!searchQuery.trim()) return purchases;

    const query = searchQuery.toLowerCase();
    return purchases.filter(p => 
      p.transactionId?.toLowerCase().includes(query) ||
      p.productTitle?.toLowerCase().includes(query) ||
      p.userEmail?.toLowerCase().includes(query) ||
      p.userName?.toLowerCase().includes(query)
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

  // Calculate summary stats
  const summary = useMemo(() => {
    const filtered = filteredPurchases.filter(p => p.status === 'completed');
    const totalRevenue = filtered.reduce((sum, p) => sum + (p.productPrice || 0), 0);
    const avgOrderValue = filtered.length > 0 ? totalRevenue / filtered.length : 0;

    return {
      totalPurchases: filteredPurchases.length,
      completedPurchases: filtered.length,
      totalRevenue,
      avgOrderValue,
    };
  }, [filteredPurchases]);

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
            <div className="summary-label">Total Revenue</div>
            <div className="summary-value">{formatPrice(summary.totalRevenue)}</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Avg Order Value</div>
            <div className="summary-value">{formatPrice(summary.avgOrderValue)}</div>
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
                        <div className="user-name">{purchase.userName || 'N/A'}</div>
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
                    <td className="price-cell">{formatPrice(purchase.productPrice)}</td>
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
          <p>Showing {filteredPurchases.length} of {purchases.length} purchases</p>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default PurchaseList;

