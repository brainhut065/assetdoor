// Products List Page
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import Layout from '../../components/Layout/Layout';
import { theme } from '../../styles/theme';
import './ProductList.css';

const ProductList = () => {
  const { products, loading, error, removeProduct } = useProducts();
  const { categories } = useCategories();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await removeProduct(id);
      } catch (err) {
        alert('Failed to delete product: ' + err.message);
      }
    }
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `$${price.toFixed(2)}`;
    }
    return price || '$0.00';
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
                <option key={cat.id} value={cat.name}>{cat.name}</option>
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
                  <div className="product-meta">
                    <span className="product-category">{product.category}</span>
                    <span className="product-price">{formatPrice(product.price)}</span>
                  </div>
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
          <p>Showing {filteredProducts.length} of {products.length} products</p>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductList;

