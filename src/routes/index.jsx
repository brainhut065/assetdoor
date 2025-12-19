// App Routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import ProductList from '../pages/Products/ProductList';
import ProductCreate from '../pages/Products/ProductCreate';
import ProductEdit from '../pages/Products/ProductEdit';
import Categories from '../pages/Categories/Categories';
import PurchaseList from '../pages/Purchases/PurchaseList';
import PurchaseDetail from '../pages/Purchases/PurchaseDetail';
import UserList from '../pages/Users/UserList';
import UserDetail from '../pages/Users/UserDetail';
import IapProductList from '../pages/IapProducts/IapProductList';
import Settings from '../pages/Settings/Settings';
import LegalPages from '../pages/Settings/LegalPages';
import ContactDetails from '../pages/Settings/ContactDetails';
import FAQs from '../pages/Settings/FAQs';
import TermsPage from '../pages/Public/TermsPage';
import PrivacyPage from '../pages/Public/PrivacyPage';
import SafetyPage from '../pages/Public/SafetyPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#4A4A4A'
      }}>
        Loading...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '18px',
        color: '#4A4A4A'
      }}>
        Loading...
      </div>
    );
  }
  
  // Redirect to dashboard if already logged in
  return user ? <Navigate to="/dashboard" replace /> : children;
};

// Public route that doesn't require authentication and doesn't redirect
const OpenPublicRoute = ({ children }) => {
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <ProductList />
            </PrivateRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <PrivateRoute>
              <ProductCreate />
            </PrivateRoute>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <PrivateRoute>
              <ProductEdit />
            </PrivateRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <PrivateRoute>
              <Categories />
            </PrivateRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <PrivateRoute>
              <PurchaseList />
            </PrivateRoute>
          }
        />
        <Route
          path="/purchases/:id"
          element={
            <PrivateRoute>
              <PurchaseDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserList />
            </PrivateRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <PrivateRoute>
              <UserDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/iap-products"
          element={
            <PrivateRoute>
              <IapProductList />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/legal-pages"
          element={
            <PrivateRoute>
              <LegalPages />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/contact-details"
          element={
            <PrivateRoute>
              <ContactDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings/faqs"
          element={
            <PrivateRoute>
              <FAQs />
            </PrivateRoute>
          }
        />
        {/* Public routes for legal pages - accessible without authentication */}
        <Route
          path="/terms"
          element={
            <OpenPublicRoute>
              <TermsPage />
            </OpenPublicRoute>
          }
        />
        <Route
          path="/privacy"
          element={
            <OpenPublicRoute>
              <PrivacyPage />
            </OpenPublicRoute>
          }
        />
        <Route
          path="/safety"
          element={
            <OpenPublicRoute>
              <SafetyPage />
            </OpenPublicRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
