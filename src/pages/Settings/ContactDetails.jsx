// Contact Details Management
import { useState, useEffect } from 'react';
import { getContactDetails, updateContactDetails } from '../../services/firebase/firestore';
import Layout from '../../components/layout/Layout';
import { theme } from '../../styles/theme';
import './Settings.css';

const ContactDetails = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [contactDetails, setContactDetails] = useState({
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadContactDetails();
  }, []);

  const loadContactDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getContactDetails();
      if (data) {
        setContactDetails({
          email: data.email || '',
          phone: data.phone || '',
        });
      }
    } catch (err) {
      console.error('Error loading contact details:', err);
      setError('Failed to load contact details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setContactDetails(prev => ({
      ...prev,
      [field]: value,
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    // Validate email is required
    if (!contactDetails.email || !contactDetails.email.trim()) {
      setError('Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactDetails.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      await updateContactDetails({
        email: contactDetails.email.trim(),
        phone: contactDetails.phone.trim() || null, // Store null if empty
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving contact details:', err);
      setError('Failed to save contact details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Contact Details">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Contact Details">
      <div className="settings-container">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            Contact details saved successfully!
          </div>
        )}

        <div className="settings-section">
          <h2>Contact Information</h2>
          <p className="settings-description">
            Update your contact details that will be displayed in the mobile app's Help & Contact screen.
          </p>

          <div className="form-group">
            <label htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={contactDetails.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="support@assetdoor.com"
              required
            />
            <p className="form-hint">This email will be displayed in the app's contact section.</p>
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Phone Number <span className="optional">(Optional)</span>
            </label>
            <input
              type="tel"
              id="phone"
              className="form-input"
              value={contactDetails.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
            <p className="form-hint">Phone number is optional. Leave empty if you don't want to display it.</p>
          </div>
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default ContactDetails;

