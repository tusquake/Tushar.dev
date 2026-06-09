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
import Profile from './pages/Profile';

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
    if (!isAuthenticated || !user || user.subscriptionTier !== 'none' || user.role === 'ADMIN') {
      setTimeLeft(null);
      setSubModalOpen(false);
      return;
    }

    const checkTime = () => {
      const registeredTime = new Date(user.trialStartedAt || user.createdAt).getTime();
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
      {isAuthenticated && user && user.role !== 'ADMIN' && user.subscriptionTier === 'none' && timeLeft !== null && timeLeft > 0 && (
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

      {/* trial expired blocker lock screen */}
      {isAuthenticated && user && user.role !== 'ADMIN' && user.subscriptionTier === 'none' && timeLeft === 0 && (
        <div className="fixed inset-0 z-[9998] bg-dark-950/90 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-dark-900 border border-dark-800 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
            {/* Design accents */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-6 text-primary-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-5a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-extrabold text-white mb-2 font-display">
              Free Session Expired
            </h2>
            <p className="text-sm text-dark-350 mb-6 leading-relaxed">
              Your 5-minute free preview session has ended. To continue using the DSA compilers, AI mock interviews, and LaTeX resume builders, activate a subscription plan.
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => {
                  setRequiredTier('basic');
                  setSubModalOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs tracking-wider transition-all duration-150 shadow-lg shadow-primary-500/20 cursor-pointer"
              >
                Choose Subscription Plan
              </button>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="w-full py-3.5 rounded-xl border border-dark-850 hover:border-dark-750 text-dark-400 hover:text-white font-bold text-xs tracking-wider transition-all duration-150 cursor-pointer"
              >
                Log Out / Switch Account
              </button>
            </div>
          </div>
        </div>
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
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
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
