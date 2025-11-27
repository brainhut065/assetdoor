// File Uploader Component for Digital Files
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../../services/firebase/storage';
import './FileUploader.css';

const FileUploader = ({ onUpload, error, existingFile, label = 'Digital File' }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(existingFile || null);
  const [uploadError, setUploadError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null); // Store selected file during upload

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file size (1GB max)
    if (file.size > 1024 * 1024 * 1024) {
      setUploadError('File size must be less than 1GB');
      return;
    }

    // Store selected file to show in dropzone during upload
    setSelectedFile(file);

    // Upload to Firebase Storage
    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(0);

      const fileName = `${Date.now()}_${file.name}`;
      
      // Pass progress callback to update progress state
      const result = await uploadFile(file, fileName, (progress) => {
        setUploadProgress(progress);
      });
      
      const fileData = {
        file,
        url: result.url,
        path: result.path,
        name: result.name,
        size: result.size,
        type: result.type,
      };
      
      setUploadedFile(fileData);
      setSelectedFile(null); // Clear selected file after successful upload
      
      if (onUpload) {
        onUpload(fileData);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload file');
      setSelectedFile(null);
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
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemove = () => {
    setUploadedFile(null);
    setUploadError(null);
    setUploadProgress(0);
    setSelectedFile(null);
    if (onUpload) {
      onUpload(null);
    }
  };

  return (
    <div className="file-uploader">
      <label className="upload-label">{label} *</label>
      
      {error && (
        <div className="upload-error">{error}</div>
      )}
      
      {uploadError && (
        <div className="upload-error">{uploadError}</div>
      )}

      {uploadedFile && !uploading ? (
        <div className="file-preview-container">
          <div className="file-preview">
            <div className="file-icon">📦</div>
            <div className="file-info">
              <div className="file-name">{uploadedFile.name || uploadedFile.file?.name}</div>
              <div className="file-meta">
                {uploadedFile.size && formatFileSize(uploadedFile.size)}
                {uploadedFile.type && ` • ${uploadedFile.type}`}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="remove-file-button"
          >
            Remove File
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="upload-progress-inline">
              <div className="file-icon">📦</div>
              <div className="file-info-inline">
                <div className="file-name-inline">{selectedFile?.name || 'Uploading...'}</div>
                <div className="file-meta-inline">
                  {selectedFile && formatFileSize(selectedFile.size)}
                </div>
              </div>
              <div className="progress-container">
                <div className="progress-bar-wrapper">
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="progress-text">Uploading... {uploadProgress}%</span>
              </div>
            </div>
          ) : (
            <>
              <div className="dropzone-icon">📦</div>
              <p className="dropzone-text">
                {isDragActive
                  ? 'Drop the file here'
                  : 'Drag & drop a file here, or click to select'}
              </p>
              <p className="dropzone-hint">ZIP, PDF, or other files (Max 1GB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
