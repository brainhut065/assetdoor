// Dashboard Page
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { theme } from '../../styles/theme';
import './Dashboard.css';

const Dashboard = () => {
  const { authError } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">${(stats?.totalRevenue || 0).toFixed(2)}</div>
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
