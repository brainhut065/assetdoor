// Product Create Page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import Layout from '../../components/Layout/Layout';
import ProductForm from './ProductForm';
import './ProductCreate.css';

const ProductCreate = () => {
  const { addProduct } = useProducts();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (productData) => {
    try {
      setLoading(true);
      setError('');
      await addProduct(productData);
      navigate('/products');
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <Layout title="CREATE PRODUCT" showBack={true} backPath="/products">
      <div className="product-create-page">
        <div className="page-main">
        {error && (
          <div className="error-banner">
            Error: {error}
          </div>
        )}

        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
        </div>
      </div>
    </Layout>
  );
};

export default ProductCreate;

