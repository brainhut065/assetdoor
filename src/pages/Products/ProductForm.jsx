// Product Form Component
import { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { useIapProducts } from '../../hooks/useIapProducts';
import ImageUploader from '../../components/product/ImageUploader';
import FileUploader from '../../components/product/FileUploader';
import IapProductDropdown from '../../components/product/IapProductDropdown';
import './ProductForm.css';

const ProductForm = ({ product, onSubmit, onCancel, loading }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { iapProducts: allIapProducts } = useIapProducts({ platform: 'All' });
  
  // Filter IAP products by platform
  const androidIapProducts = allIapProducts.filter(p => p.platform === 'android');
  const iosIapProducts = allIapProducts.filter(p => p.platform === 'ios');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    category: '', // Keep for display/search purposes
    isActive: true,
    isFeatured: false,
    tags: '',
    // IAP fields
    iapProductIdAndroid: null,
    iapProductIdIOS: null,
    isFree: false,
    displayPrice: null,
    displayCurrency: null,
  });
  const [imageData, setImageData] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        category: product.category || '', // Keep for backward compatibility/display
        isActive: product.isActive !== false,
        isFeatured: product.isFeatured || false,
        tags: product.tags ? product.tags.join(', ') : '',
        // IAP fields
        iapProductIdAndroid: product.iapProductIdAndroid || null,
        iapProductIdIOS: product.iapProductIdIOS || null,
        isFree: product.isFree || false,
        displayPrice: product.displayPrice || null,
        displayCurrency: product.displayCurrency || null,
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

  // Handle IAP product selection
  const handleIapProductSelect = (platform, iapProductId) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (platform === 'android') {
        newData.iapProductIdAndroid = iapProductId;
        // Update display price from selected IAP product
        if (iapProductId) {
          const selectedProduct = androidIapProducts.find(p => p.id === iapProductId);
          if (selectedProduct && selectedProduct.prices && selectedProduct.prices.length > 0) {
            // Prioritize INR, USD, EUR
            const preferred = ['INR', 'USD', 'EUR'];
            let priceObj = null;
            for (const currency of preferred) {
              priceObj = selectedProduct.prices.find(p => p.currency === currency);
              if (priceObj) break;
            }
            if (!priceObj && selectedProduct.prices.length > 0) {
              priceObj = selectedProduct.prices[0];
            }
            if (priceObj) {
              newData.displayPrice = priceObj.amount;
              newData.displayCurrency = priceObj.currency;
            }
          }
        } else {
          // Clear display price if no Android IAP and no iOS IAP
          if (!newData.iapProductIdIOS) {
            newData.displayPrice = null;
            newData.displayCurrency = null;
          }
        }
      } else if (platform === 'ios') {
        newData.iapProductIdIOS = iapProductId;
        // Update display price from selected IAP product
        if (iapProductId) {
          const selectedProduct = iosIapProducts.find(p => p.id === iapProductId);
          if (selectedProduct && selectedProduct.prices && selectedProduct.prices.length > 0) {
            const preferred = ['INR', 'USD', 'EUR'];
            let priceObj = null;
            for (const currency of preferred) {
              priceObj = selectedProduct.prices.find(p => p.currency === currency);
              if (priceObj) break;
            }
            if (!priceObj && selectedProduct.prices.length > 0) {
              priceObj = selectedProduct.prices[0];
            }
            if (priceObj) {
              newData.displayPrice = priceObj.amount;
              newData.displayCurrency = priceObj.currency;
            }
          }
        } else {
          // Only clear if no Android IAP is selected
          if (!newData.iapProductIdAndroid) {
            newData.displayPrice = null;
            newData.displayCurrency = null;
          }
        }
      }
      
      // If IAP is selected, product is not free
      if (newData.iapProductIdAndroid || newData.iapProductIdIOS) {
        newData.isFree = false;
      }
      
      return newData;
    });
    
    // Clear errors when user selects IAP
    if (errors.isFree || errors.iap) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.isFree;
        delete newErrors.iap;
        return newErrors;
      });
    }
  };

  // Handle free product checkbox
  const handleFreeProductChange = (e) => {
    const isFree = e.target.checked;
    setFormData(prev => ({
      ...prev,
      isFree,
      // Clear IAP selections if marking as free
      iapProductIdAndroid: isFree ? null : prev.iapProductIdAndroid,
      iapProductIdIOS: isFree ? null : prev.iapProductIdIOS,
      displayPrice: isFree ? null : prev.displayPrice,
      displayCurrency: isFree ? null : prev.displayCurrency,
    }));
    // Clear errors when user changes free product status
    if (errors.isFree || errors.iap) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.isFree;
        delete newErrors.iap;
        return newErrors;
      });
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

    if (!formData.categoryId) {
      newErrors.category = 'Category is required';
    }

    if (!imageData && !product?.imageUrl) {
      newErrors.image = 'Product image is required';
    }

    if (!fileData && !product?.fileUrl) {
      newErrors.file = 'Digital file is required';
    }

    // IAP validation
    // Rule: If no IAP is selected, user MUST select "Free Product"
    const hasIapSelected = formData.iapProductIdAndroid || formData.iapProductIdIOS;
    
    if (!hasIapSelected && !formData.isFree) {
      newErrors.iap = 'Please link an IAP product or mark as "Free Product"';
      newErrors.isFree = 'You must select "Free Product" if no IAP is linked';
    }
    
    // If marked as free, IAP should not be linked
    if (formData.isFree && hasIapSelected) {
      newErrors.iap = 'Free products cannot have IAP linked. Please clear IAP selections or uncheck "Free Product"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    // Determine price based on IAP or free status
    // If IAP is linked, price comes from IAP (set to 0 as placeholder)
    // If free, price is 0
    // Price field is kept for backward compatibility but not used for display
    const hasIap = formData.iapProductIdAndroid || formData.iapProductIdIOS;
    const finalPrice = formData.isFree || !hasIap ? 0 : 0; // Always 0, price comes from IAP
    const finalPriceFormatted = formData.isFree ? 'FREE' : (hasIap ? '$0.00' : 'FREE');

    // Get category name from selected category ID for display/search purposes
    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : '';

    const productData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      categoryId: formData.categoryId, // Use category ID (document ID)
      category: categoryName, // Keep category name for display/search purposes
      price: finalPrice, // Kept for backward compatibility, not used for display
      priceFormatted: finalPriceFormatted, // Kept for backward compatibility, not used for display
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
      // IAP fields
      iapProductIdAndroid: formData.iapProductIdAndroid || null,
      iapProductIdIOS: formData.iapProductIdIOS || null,
      isFree: formData.isFree || false,
      displayPrice: formData.displayPrice || null,
      displayCurrency: formData.displayCurrency || null,
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

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            disabled={loading || categoriesLoading}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
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

      {/* IAP Configuration Section */}
      <div className="form-section">
        <h3 className="form-section-title">IAP Configuration</h3>
        <div className="form-section-content">
          {errors.iap && (
            <div className="error-banner" style={{ marginBottom: '16px' }}>
              {errors.iap}
            </div>
          )}

          <IapProductDropdown
            label="Android IAP Product"
            platform="android"
            iapProducts={androidIapProducts}
            selectedIapProductId={formData.iapProductIdAndroid}
            onSelect={(id) => handleIapProductSelect('android', id)}
            disabled={loading || formData.isFree}
            error={errors.iapProductIdAndroid}
          />

          <IapProductDropdown
            label="iOS IAP Product"
            platform="ios"
            iapProducts={iosIapProducts}
            selectedIapProductId={formData.iapProductIdIOS}
            onSelect={(id) => handleIapProductSelect('ios', id)}
            disabled={loading || formData.isFree}
            error={errors.iapProductIdIOS}
          />

          <div className="form-group checkbox-group" style={{ marginTop: '16px' }}>
            <label>
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleFreeProductChange}
                disabled={loading}
                className={errors.isFree ? 'error' : ''}
              />
              <span>Free Product (No IAP required) *</span>
            </label>
            <small className="form-hint" style={{ display: 'block', marginTop: '4px', color: errors.isFree ? '#E53935' : '#8A8A8A' }}>
              {errors.isFree 
                ? errors.isFree 
                : 'Required: Check this if the product is free and doesn\'t require an IAP purchase. You must select either an IAP product or mark as free.'}
            </small>
            {errors.isFree && <span className="error-message" style={{ marginTop: '4px', display: 'block' }}>{errors.isFree}</span>}
          </div>

          {(formData.iapProductIdAndroid || formData.iapProductIdIOS) && (
            <div className="iap-info-box" style={{
              marginTop: '16px',
              padding: '12px',
              background: '#E3F2FD',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              <strong>IAP Info:</strong>
              {formData.displayPrice && formData.displayCurrency && (
                <div style={{ marginTop: '4px' }}>
                  Display Price: {formData.displayPrice} {formData.displayCurrency}
                </div>
              )}
            </div>
          )}
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

