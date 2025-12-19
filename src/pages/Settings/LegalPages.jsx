// Legal Pages Management with Rich Text Editor
import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Timestamp } from 'firebase/firestore';
import { getLegalPages, updateLegalPages } from '../../services/firebase/firestore';
import Layout from '../../components/layout/Layout';
import { theme } from '../../styles/theme';
import './LegalPages.css';

const LegalPages = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [legalPages, setLegalPages] = useState({
    termsAndConditions: {
      content: '',
      lastUpdated: null,
    },
    privacyPolicy: {
      content: '',
      lastUpdated: null,
    },
    safetyPolicy: {
      content: '',
      lastUpdated: null,
    },
  });

  // Quill editor modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'link'
  ];

  // Helper function to format lastUpdated date (handles Timestamp, string, or Date)
  const formatLastUpdated = (lastUpdated) => {
    if (!lastUpdated) return null;
    
    try {
      // If it's a Firestore Timestamp object
      if (lastUpdated && typeof lastUpdated.toDate === 'function') {
        return lastUpdated.toDate().toLocaleString();
      }
      
      // If it's a string (ISO format)
      if (typeof lastUpdated === 'string') {
        return new Date(lastUpdated).toLocaleString();
      }
      
      // If it's already a Date
      if (lastUpdated instanceof Date) {
        return lastUpdated.toLocaleString();
      }
      
      // If it's a Timestamp with seconds/nanoseconds
      if (lastUpdated.seconds) {
        return new Date(lastUpdated.seconds * 1000).toLocaleString();
      }
      
      // Fallback
      return new Date(lastUpdated).toLocaleString();
    } catch (e) {
      console.error('Error formatting date:', e);
      return null;
    }
  };

  useEffect(() => {
    loadLegalPages();
  }, []);

  const loadLegalPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLegalPages();
      if (data) {
        setLegalPages({
          termsAndConditions: data.termsAndConditions || { content: '', lastUpdated: null },
          privacyPolicy: data.privacyPolicy || { content: '', lastUpdated: null },
          safetyPolicy: data.safetyPolicy || { content: '', lastUpdated: null },
        });
      }
    } catch (err) {
      console.error('Error loading legal pages:', err);
      setError('Failed to load legal pages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (pageType, content) => {
    setLegalPages(prev => ({
      ...prev,
      [pageType]: {
        ...prev[pageType],
        content,
      },
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      const updateData = {
        termsAndConditions: {
          ...legalPages.termsAndConditions,
          lastUpdated: Timestamp.now(),
        },
        privacyPolicy: {
          ...legalPages.privacyPolicy,
          lastUpdated: Timestamp.now(),
        },
        safetyPolicy: {
          ...legalPages.safetyPolicy,
          lastUpdated: Timestamp.now(),
        },
      };
      
      await updateLegalPages(updateData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving legal pages:', err);
      setError('Failed to save legal pages. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Legal Pages">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Legal Pages">
      <div className="legal-pages-container">
        {error && (
          <div className="error-message" style={{ 
            padding: '12px', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message" style={{ 
            padding: '12px', 
            backgroundColor: '#efe', 
            color: '#3c3', 
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            Legal pages saved successfully!
          </div>
        )}

        <div className="legal-pages-tabs">
          <div className="tab-content">
            <div className="legal-page-section">
              <h2>Terms & Conditions</h2>
              <div className="last-updated">
                {formatLastUpdated(legalPages.termsAndConditions.lastUpdated) && (
                  <span>Last updated: {formatLastUpdated(legalPages.termsAndConditions.lastUpdated)}</span>
                )}
              </div>
              <div className="rich-text-editor-wrapper">
                <ReactQuill
                  theme="snow"
                  value={legalPages.termsAndConditions.content}
                  onChange={(content) => handleContentChange('termsAndConditions', content)}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter Terms & Conditions content here. Use the toolbar to format text (bold, headers, lists, etc.)..."
                />
              </div>
            </div>

            <div className="legal-page-section">
              <h2>Privacy Policy</h2>
              <div className="last-updated">
                {formatLastUpdated(legalPages.privacyPolicy.lastUpdated) && (
                  <span>Last updated: {formatLastUpdated(legalPages.privacyPolicy.lastUpdated)}</span>
                )}
              </div>
              <div className="rich-text-editor-wrapper">
                <ReactQuill
                  theme="snow"
                  value={legalPages.privacyPolicy.content}
                  onChange={(content) => handleContentChange('privacyPolicy', content)}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter Privacy Policy content here. Use the toolbar to format text (bold, headers, lists, etc.)..."
                />
              </div>
            </div>

            <div className="legal-page-section">
              <h2>Safety Policy</h2>
              <div className="last-updated">
                {formatLastUpdated(legalPages.safetyPolicy.lastUpdated) && (
                  <span>Last updated: {formatLastUpdated(legalPages.safetyPolicy.lastUpdated)}</span>
                )}
              </div>
              <div className="rich-text-editor-wrapper">
                <ReactQuill
                  theme="snow"
                  value={legalPages.safetyPolicy.content}
                  onChange={(content) => handleContentChange('safetyPolicy', content)}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Enter Safety Policy content here. Use the toolbar to format text (bold, headers, lists, etc.)..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="legal-pages-actions">
          <button
            className="save-button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '12px 24px',
              backgroundColor: theme.colors.yellowPrimary,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default LegalPages;
