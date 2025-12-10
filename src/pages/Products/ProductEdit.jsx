// Product Edit Page
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { getProduct } from '../../services/firebase/firestore';
import Layout from '../../components/layout/Layout';
import ProductForm from './ProductForm';
import './ProductCreate.css';

const ProductEdit = () => {
  const { id } = useParams();
  const { editProduct, removeProduct } = useProducts();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getProduct(id);
      if (data) {
        setProduct(data);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (productData) => {
    try {
      setSaving(true);
      setError('');
      await editProduct(id, productData);
      navigate('/products');
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product.title}"? This action cannot be undone.`)) {
      try {
        await removeProduct(id);
        navigate('/products');
      } catch (err) {
        setError(err.message || 'Failed to delete product');
      }
    }
  };

  if (loading) {
    return (
      <Layout title="EDIT PRODUCT" showBack={true} backPath="/products">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
          <p>Loading product...</p>
        </div>
      </Layout>
    );
  }

  if (error && !product) {
    return (
      <Layout title="EDIT PRODUCT" showBack={true} backPath="/products">
        <div className="page-main">
          <div className="error-banner">{error}</div>
          <button onClick={() => navigate('/products')} className="cancel-button">
            Back to Products
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="EDIT PRODUCT" showBack={true} backPath="/products">
      <div className="product-create-page">
        <div className="page-main">
        {error && (
          <div className="error-banner">
            Error: {error}
          </div>
        )}

        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={saving}
        />

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E0E0E0' }}>
          <button
            onClick={handleDelete}
            className="delete-button"
            style={{
              padding: '12px 24px',
              background: '#FFEBEE',
              color: '#E53935',
              border: '1px solid #E53935',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '900',
              cursor: 'pointer',
            }}
          >
            Delete Product
          </button>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductEdit;

