// Image Uploader Component
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadImage } from '../../services/firebase/storage';
import './ImageUploader.css';

const ImageUploader = ({ onUpload, error, existingImage, label = 'Product Image' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState(existingImage || null);
  const [uploadError, setUploadError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage
    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      const fileName = `${Date.now()}_${file.name}`;
      
      // Pass progress callback to update progress state
      const result = await uploadImage(file, fileName, (progress) => {
        setUploadProgress(progress);
      });
      
      if (onUpload) {
        onUpload({
          file,
          url: result.url,
          path: result.path,
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload image');
      setPreview(null);
      setUploadProgress(0);
    } finally {
      setUploading(false);
      // Keep progress at 100% for a moment before resetting
      setTimeout(() => {
        setUploadProgress(0);
      }, 2000);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemove = () => {
    setPreview(null);
    setUploadError(null);
    setUploadProgress(0);
    if (onUpload) {
      onUpload(null);
    }
  };

  return (
    <div className="image-uploader">
      <label className="upload-label">{label} *</label>
      
      {error && (
        <div className="upload-error">{error}</div>
      )}
      
      {uploadError && (
        <div className="upload-error">{uploadError}</div>
      )}

      {preview ? (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            {uploading && (
              <div className="upload-overlay">
                <div className="upload-progress">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                  <span>Uploading... {uploadProgress}%</span>
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="remove-image-button"
            disabled={uploading}
          >
            Remove Image
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="upload-progress">
              <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              <span>Uploading... {uploadProgress}%</span>
            </div>
          ) : (
            <>
              <div className="dropzone-icon">📷</div>
              <p className="dropzone-text">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag & drop an image here, or click to select'}
              </p>
              <p className="dropzone-hint">JPG, PNG (Max 5MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
