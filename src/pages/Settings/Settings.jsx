// Settings Index Page - Lists all settings options
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { theme } from '../../styles/theme';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      id: 'legal-pages',
      title: 'Legal Pages',
      description: 'Manage Terms & Conditions, Privacy Policy, and Safety Policy',
      icon: '📄',
      path: '/settings/legal-pages',
      color: '#667eea',
    },
    {
      id: 'contact-details',
      title: 'Contact Details',
      description: 'Update email and phone number displayed in the app',
      icon: '📧',
      path: '/settings/contact-details',
      color: '#FFD700',
    },
    {
      id: 'faqs',
      title: 'Frequently Asked Questions',
      description: 'Manage FAQs displayed in the Help & Contact screen',
      icon: '❓',
      path: '/settings/faqs',
      color: '#4CAF50',
    },
  ];

  return (
    <Layout title="Settings">
      <div className="settings-index-container">
        <p className="settings-index-description">
          Manage your app settings, legal pages, contact information, and FAQs.
        </p>

        <div className="settings-grid">
          {settingsOptions.map((option) => (
            <div
              key={option.id}
              className="settings-card"
              onClick={() => navigate(option.path)}
              style={{
                cursor: 'pointer',
                border: `2px solid ${option.color}20`,
              }}
            >
              <div className="settings-card-icon" style={{ color: option.color }}>
                {option.icon}
              </div>
              <h3 className="settings-card-title">{option.title}</h3>
              <p className="settings-card-description">{option.description}</p>
              <div className="settings-card-arrow">
                <span style={{ color: option.color }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;

