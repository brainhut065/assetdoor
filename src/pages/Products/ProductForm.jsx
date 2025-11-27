// Product Form Component
import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import ImageUploader from '../../components/product/ImageUploader';
import FileUploader from '../../components/product/FileUploader';
import './ProductForm.css';

const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    isActive: true,
    isFeatured: false,
    tags: '',
  });
  const [imageData, setImageData] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price || '',
        isActive: product.isActive !== false,
        isFeatured: product.isFeatured || false,
        tags: product.tags ? product.tags.join(', ') : '',
      });
      if (product.imageUrl) {
        setImageData({ url: product.imageUrl, path: product.imagePath });
      }
      if (product.fileUrl) {
        setFileData({
          url: product.fileUrl,
          path: product.filePath,
          name: product.fileName,
          size: product.fileSize,
          type: product.fileType,
        });
      }
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    if (!imageData && !product?.imageUrl) {
      newErrors.image = 'Product image is required';
    }

    if (!fileData && !product?.fileUrl) {
      newErrors.file = 'Digital file is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const priceNum = parseFloat(formData.price);
    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const productData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price: priceNum,
      priceFormatted: `$${priceNum.toFixed(2)}`,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      tags: tagsArray,
      imageUrl: imageData?.url || product?.imageUrl || '',
      imagePath: imageData?.path || product?.imagePath || '',
      fileUrl: fileData?.url || product?.fileUrl || '',
      filePath: fileData?.path || product?.filePath || '',
      fileName: fileData?.name || product?.fileName || fileData?.file?.name || '',
      fileSize: fileData?.size || product?.fileSize || fileData?.file?.size || 0,
      fileType: fileData?.type || product?.fileType || fileData?.file?.type || '',
    };

    await onSubmit(productData);
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter product title"
            disabled={loading}
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Enter product description"
            disabled={loading}
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>
      </div>

      <div className="form-row form-row-2">
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            disabled={loading || categoriesLoading}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            disabled={loading}
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>
      </div>

      <ImageUploader
        onUpload={setImageData}
        error={errors.image}
        existingImage={product?.imageUrl}
      />

      <FileUploader
        onUpload={setFileData}
        error={errors.file}
        existingFile={product?.fileUrl ? {
          url: product.fileUrl,
          name: product.fileName,
          size: product.fileSize,
          type: product.fileType,
        } : null}
      />

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tag1, tag2, tag3"
            disabled={loading}
          />
          <small className="form-hint">Separate tags with commas</small>
        </div>
      </div>

      <div className="form-row form-row-2">
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Active (visible to users)</span>
          </label>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Featured Product</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="cancel-button"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;

