// Users List Page
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import Layout from '../../components/Layout/Layout';
import { formatPrice, formatDate } from '../../utils/formatters';
import './UserList.css';

const UserList = () => {
  const { users, loading, error } = useUsers();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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
    const totalRevenue = users.reduce((sum, u) => sum + (u.totalSpent || 0), 0);

    return {
      totalUsers,
      activeUsers,
      usersWithPurchases,
      totalRevenue,
    };
  }, [users]);

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
            <div className="summary-label">Total Revenue</div>
            <div className="summary-value">{formatPrice(summary.totalRevenue)}</div>
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
                      <strong>Spent:</strong> {formatPrice(user.totalSpent || 0)}
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
          <p>Showing {filteredUsers.length} of {users.length} users</p>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserList;

