import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Projects from './pages/Projects';
import AboutCreator from './pages/AboutCreator';
import Learning from './pages/Learning';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import AtsReviewer from './pages/AtsReviewer';
import LatexResume from './pages/LatexResume';
import Settings from './pages/Settings';

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
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password/:token" element={<ResetPassword />} />
            
            {/* Redirect legacy portfolio subpages to AboutCreator */}
            <Route path="experience" element={<Navigate to="/about" replace />} />
            <Route path="skills" element={<Navigate to="/about" replace />} />
            <Route path="certificates" element={<Navigate to="/about" replace />} />

            {/* Protected pages */}
            <Route path="projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="about" element={<ProtectedRoute><AboutCreator /></ProtectedRoute>} />
            <Route path="learning" element={<ProtectedRoute><Learning /></ProtectedRoute>} />
            <Route path="contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="resume/builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
            <Route path="resume/reviewer" element={<ProtectedRoute><AtsReviewer /></ProtectedRoute>} />
            <Route path="resume/latex" element={<ProtectedRoute><LatexResume /></ProtectedRoute>} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
