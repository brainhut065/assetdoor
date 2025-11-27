// Main App Component
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/index';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
