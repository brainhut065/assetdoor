// Public Terms & Conditions Page
import { useState, useEffect } from 'react';
import { getLegalPages } from '../../services/firebase/firestore';
import './PublicPage.css';

const TermsPage = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getLegalPages();
      if (data && data.termsAndConditions) {
        setContent(data.termsAndConditions.content || '');
        setLastUpdated(data.termsAndConditions.lastUpdated || null);
      }
    } catch (err) {
      console.error('Error loading terms:', err);
      setError('Unable to load terms and conditions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '';
    try {
      let date;
      
      // If it's a Firestore Timestamp object with toDate method
      if (dateValue && typeof dateValue.toDate === 'function') {
        date = dateValue.toDate();
      }
      // If it's a Timestamp object with seconds property
      else if (dateValue && dateValue.seconds) {
        date = new Date(dateValue.seconds * 1000);
      }
      // If it's a string (ISO format)
      else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      }
      // If it's already a Date object
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      else {
        return '';
      }
      
      if (isNaN(date.getTime())) {
        return '';
      }
      
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch (e) {
      console.error('Error formatting date:', e, dateValue);
      return '';
    }
  };

  return (
    <div className="public-page">
      <div className="public-page-container">
        <header className="public-page-header">
          <h1>Terms & Conditions</h1>
          {lastUpdated && (
            <p className="last-updated">Last Updated: {formatDate(lastUpdated)}</p>
          )}
        </header>

        <main className="public-page-content">
          {loading && (
            <div className="loading">
              <p>Loading...</p>
            </div>
          )}

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="content">
              {content ? (
                <div
                  className="legal-content"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p>Terms and conditions content is not available.</p>
              )}
            </div>
          )}
        </main>

        <footer className="public-page-footer">
          <p>&copy; {new Date().getFullYear()} AssetDoor. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default TermsPage;

