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
import AIInterview from './pages/AIInterview';
import CodeEditor from './pages/CodeEditor';

import { useState } from 'react';
import SubscriptionModal from './components/common/SubscriptionModal';
import { useAuth } from './context/AuthContext';

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

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [requiredTier, setRequiredTier] = useState('basic');
  const [timeLeft, setTimeLeft] = useState(null);

  // Listen for API 402 subscription errors
  useEffect(() => {
    const handleSubRequired = (e) => {
      const required = e.detail?.requiredTier || 'basic';
      setRequiredTier(required);
      setSubModalOpen(true);
    };

    window.addEventListener('subscription-required', handleSubRequired);
    return () => window.removeEventListener('subscription-required', handleSubRequired);
  }, []);

  // Track 5 minutes trial timer
  useEffect(() => {
    if (!isAuthenticated || !user || user.subscriptionTier !== 'none') {
      setTimeLeft(null);
      setSubModalOpen(false);
      return;
    }

    const checkTime = () => {
      const registeredTime = new Date(user.createdAt).getTime();
      const elapsed = Date.now() - registeredTime;
      const limit = 5 * 60 * 1000; // 5 minutes
      const remaining = limit - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        setRequiredTier('basic');
        setSubModalOpen(true);
      } else {
        setTimeLeft(remaining);
      }
    };

    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const formatTime = (ms) => {
    if (ms === null || ms <= 0) return '0:00';
    const totalSecs = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <>
      {/* Floating trial timer widget */}
      {isAuthenticated && user && user.subscriptionTier === 'none' && timeLeft !== null && timeLeft > 0 && (
        <div className="fixed bottom-4 right-4 z-[9999] bg-dark-900 border border-primary-500/30 text-white px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-2xl font-mono text-[10px]">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
          <span>Trial Access: <strong className="text-primary-400">{formatTime(timeLeft)}</strong> left</span>
          <button 
            onClick={() => {
              setRequiredTier('basic');
              setSubModalOpen(true);
            }}
            className="bg-primary-500 hover:bg-primary-600 px-2.5 py-1 rounded text-white font-bold transition-all text-[9px] cursor-pointer"
          >
            Unlock Plan
          </button>
        </div>
      )}

      {/* trial expired blocker */}
      {isAuthenticated && user && user.subscriptionTier === 'none' && timeLeft === 0 && (
        <div className="fixed inset-0 z-[9998] bg-dark-950/60 backdrop-blur-sm pointer-events-auto" />
      )}

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
          <Route path="ai-interview" element={<ProtectedRoute><AIInterview /></ProtectedRoute>} />
          <Route path="code-editor" element={<ProtectedRoute><CodeEditor /></ProtectedRoute>} />
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

      <SubscriptionModal 
        isOpen={subModalOpen} 
        onClose={() => {
          if (user && user.subscriptionTier !== 'none') {
            setSubModalOpen(false);
          } else if (timeLeft !== null && timeLeft > 0) {
            setSubModalOpen(false);
          }
        }}
        requiredTier={requiredTier}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
