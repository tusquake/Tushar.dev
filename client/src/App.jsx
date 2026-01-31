import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import Certificates from './pages/Certificates';
import Skills from './pages/Skills';
import Experience from './pages/Experience';
import Learning from './pages/Learning';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Wrapper to redirect direct access to home
const DirectAccessRedirect = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is a direct entry (history length is 1 or 2 depending on browser/load)
    const isDirectEntry = window.history.length <= 2;

    if (isDirectEntry && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [navigate, location.pathname]);

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main layout routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route
              path="certificates"
              element={
                <DirectAccessRedirect>
                  <Certificates />
                </DirectAccessRedirect>
              }
            />
            <Route path="skills" element={<Skills />} />
            <Route
              path="experience"
              element={
                <DirectAccessRedirect>
                  <Experience />
                </DirectAccessRedirect>
              }
            />
            <Route path="learning" element={<Learning />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 - Not Found */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-950">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-dark-900 dark:text-white mb-4">404</h1>
                  <p className="text-dark-500 dark:text-dark-400 mb-8">Page not found</p>
                  <a href="/" className="btn-primary">Go Home</a>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
