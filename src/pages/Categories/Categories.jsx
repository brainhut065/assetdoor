// Categories Management Page
import { useState, useEffect, useRef } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { getAllProductsForCounting } from '../../services/firebase/firestore';
import Layout from '../../components/layout/Layout';
import { theme } from '../../styles/theme';
import './Categories.css';

const Categories = () => {
  const { categories, loading, error, hasMore, loadMore, addCategory, editCategory, removeCategory } = useCategories();
  const [allProductsForCounting, setAllProductsForCounting] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const loadMoreButtonRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const previousCategoriesLengthRef = useRef(0);

  // Fetch all products for accurate counting
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const allProducts = await getAllProductsForCounting();
        setAllProductsForCounting(allProducts);
      } catch (err) {
        console.error('Error fetching all products for counting:', err);
      }
    };
    fetchAllProducts();
  }, []);

  // Restore scroll position after loading more items
  useEffect(() => {
    if (!loading && categories.length > previousCategoriesLengthRef.current && scrollPositionRef.current > 0) {
      // Items were added, restore scroll position
      setTimeout(() => {
        window.scrollTo({
          top: scrollPositionRef.current,
          behavior: 'auto'
        });
        scrollPositionRef.current = 0;
      }, 0);
    }
    previousCategoriesLengthRef.current = categories.length;
  }, [loading, categories.length]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    order: 0,
    isActive: true,
  });
  const [formError, setFormError] = useState('');

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      order: categories.length,
      isActive: true,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
      order: category.order || 0,
      isActive: category.isActive !== false,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      order: 0,
      isActive: true,
    });
    setFormError('');
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    // Check for duplicate names
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === formData.name.trim().toLowerCase() && cat.id !== editingCategory?.id
    );
    if (existingCategory) {
      setFormError('Category name already exists');
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        slug: generateSlug(formData.name),
        description: formData.description.trim() || '',
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
        productCount: editingCategory?.productCount || 0,
      };

      if (editingCategory) {
        await editCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }

      handleCancel();
    } catch (err) {
      setFormError(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (category) => {
    // Count products in this category using categoryId from all products
    const productCount = allProductsForCounting.filter(p => p.categoryId === category.id).length;

    if (productCount > 0) {
      alert(`Cannot delete category "${category.name}" because it has ${productCount} product(s). Please remove or reassign products first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      try {
        await removeCategory(category.id);
        // Refresh product counts after deletion
        const allProducts = await getAllProductsForCounting();
        setAllProductsForCounting(allProducts);
      } catch (err) {
        alert('Failed to delete category: ' + err.message);
      }
    }
  };

  const getProductCount = (categoryId) => {
    // Count from all products, not just paginated ones
    // Also handle legacy products that might only have category name
    return allProductsForCounting.filter(p => {
      if (p.categoryId === categoryId) {
        return true;
      }
      // Fallback for old products without categoryId
      if (!p.categoryId && p.category) {
        const category = categories.find(cat => cat.id === categoryId);
        return category && p.category === category.name;
      }
      return false;
    }).length;
  };

  if (loading) {
    return (
      <Layout title="CATEGORIES">
        <div className="categories-page">
          <div className="categories-loading">
            <p>Loading categories...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="CATEGORIES">
      <div className="categories-page">
        <div className="categories-header-actions">
          <button
            className="add-button"
            onClick={handleAdd}
            style={{ backgroundColor: theme.colors.yellowPrimary }}
          >
            + Add New Category
          </button>
        </div>

        <div className="categories-main">
        {error && (
          <div className="error-banner">
            Error: {error}
          </div>
        )}

        {showForm && (
          <div className="category-form-container">
            <h2>{editingCategory ? 'Edit Category' : 'Create Category'}</h2>
            <form onSubmit={handleSubmit} className="category-form">
              {formError && (
                <div className="form-error">{formError}</div>
              )}

              <div className="form-group">
                <label htmlFor="name">Category Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Art, UI/UX, Music"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Optional category description"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="order">Display Order</label>
                  <input
                    type="number"
                    id="order"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                  />
                  <small className="form-hint">Lower numbers appear first</small>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Active (visible to users)</span>
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button" style={{ backgroundColor: theme.colors.yellowPrimary }}>
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="empty-state">
            <p>No categories found.</p>
            <button
              onClick={handleAdd}
              style={{ backgroundColor: theme.colors.yellowPrimary }}
            >
              Create Your First Category
            </button>
          </div>
        ) : (
          <div className="categories-list">
            {categories
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(category => (
                <div key={category.id} className="category-card">
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    {category.description && (
                      <p className="category-description">{category.description}</p>
                    )}
                    <div className="category-meta">
                      <span className="product-count">
                        {getProductCount(category.id)} product(s)
                      </span>
                      <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="category-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(category)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

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

export default Categories;

