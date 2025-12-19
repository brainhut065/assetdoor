// FAQs Management
import { useState, useEffect } from 'react';
import { getFAQs, updateFAQs } from '../../services/firebase/firestore';
import Layout from '../../components/layout/Layout';
import { theme } from '../../styles/theme';
import './Settings.css';

const FAQs = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [faqs, setFaqs] = useState([
    { question: '', answer: '' }
  ]);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFAQs();
      if (data && data.faqs && data.faqs.length > 0) {
        setFaqs(data.faqs);
      } else {
        // Start with one empty FAQ
        setFaqs([{ question: '', answer: '' }]);
      }
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError('Failed to load FAQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFAQChange = (index, field, value) => {
    const updatedFAQs = [...faqs];
    updatedFAQs[index] = {
      ...updatedFAQs[index],
      [field]: value,
    };
    setFaqs(updatedFAQs);
    setSuccess(false);
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFAQ = (index) => {
    if (faqs.length > 1) {
      const updatedFAQs = faqs.filter((_, i) => i !== index);
      setFaqs(updatedFAQs);
    }
  };

  const handleSave = async () => {
    // Filter out empty FAQs
    const validFAQs = faqs.filter(faq => 
      faq.question.trim() && faq.answer.trim()
    );

    if (validFAQs.length === 0) {
      setError('Please add at least one FAQ with both question and answer.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await updateFAQs(validFAQs);
      
      // Update local state to only include valid FAQs
      setFaqs(validFAQs.length > 0 ? validFAQs : [{ question: '', answer: '' }]);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving FAQs:', err);
      setError('Failed to save FAQs. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="FAQs">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Frequently Asked Questions">
      <div className="settings-container">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            FAQs saved successfully!
          </div>
        )}

        <div className="settings-section">
          <h2>Manage FAQs</h2>
          <p className="settings-description">
            Add, edit, or remove frequently asked questions that will be displayed in the mobile app's Help & Contact screen.
          </p>

          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div className="faq-header">
                <h3>FAQ #{index + 1}</h3>
                {faqs.length > 1 && (
                  <button
                    type="button"
                    className="remove-button"
                    onClick={() => removeFAQ(index)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#E53935',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label htmlFor={`question-${index}`}>
                  Question <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id={`question-${index}`}
                  className="form-input"
                  value={faq.question}
                  onChange={(e) => handleFAQChange(index, 'question', e.target.value)}
                  placeholder="e.g., How do I purchase a product?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor={`answer-${index}`}>
                  Answer <span className="required">*</span>
                </label>
                <textarea
                  id={`answer-${index}`}
                  className="form-textarea"
                  value={faq.answer}
                  onChange={(e) => handleFAQChange(index, 'answer', e.target.value)}
                  placeholder="e.g., Browse our catalog, select a product, and click 'Buy Now'..."
                  rows={4}
                  required
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addFAQ}
            className="add-button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            + Add Another FAQ
          </button>
        </div>

        <div className="settings-actions">
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
            {saving ? 'Saving...' : 'Save All FAQs'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default FAQs;

