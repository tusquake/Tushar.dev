import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const SubscriptionModal = ({ isOpen, onClose, requiredTier = 'basic' }) => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedTier, setSelectedTier] = useState(requiredTier);
    const [localUser, setLocalUser] = useState(user);

    useEffect(() => {
        setLocalUser(user);
    }, [user]);

    if (!isOpen) return null;

    // Simulate payment and update subscription
    const handleSubscribe = async (tier) => {
        setLoading(true);
        try {
            // Simulate Stripe/payment gateway delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const response = await authAPI.subscribe(tier);
            if (response.data?.success) {
                const updatedUser = response.data.data.user;
                // Update local storage
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Refresh memory auth state by updating context user state
                // Since our AuthContext exposes the user, we can force-reload or update via local storage
                // By notifying AuthContext via a page reload or directly if we update AuthContext.
                // Let's reload to trigger complete state sync across pages
                setSuccess(true);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Payment simulation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-4xl bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl animate-tab-switch max-h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="p-6 md:p-8 text-center border-b border-dark-800 bg-gradient-to-b from-dark-950/40 to-transparent flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-4 text-primary-400 font-bold">
                        $
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
                        Activate Your Developer Workstation
                    </h2>
                    <p className="text-xs md:text-sm text-dark-350 max-w-xl mx-auto mt-2 leading-relaxed">
                        Your free trial has expired. Subscribe to one of our developer-first plans to unlock complete access and synchronize progress.
                    </p>
                </div>

                {/* Plan Cards Container */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 grid md:grid-cols-2 gap-6 items-stretch">
                    
                    {/* Basic Card */}
                    <div className={`p-6 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                        selectedTier === 'basic' 
                            ? 'border-primary-500 bg-primary-500/5 shadow-[0_0_20px_rgba(124,58,237,0.15)]' 
                            : 'border-dark-850 bg-dark-950/40 hover:border-dark-700'
                    }`} onClick={() => setSelectedTier('basic')}>
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Basic Workspace</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-800 text-dark-300">DSA & Core</span>
                            </div>
                            <div className="mb-6">
                                <span className="text-3xl font-extrabold text-white font-display">$79</span>
                                <span className="text-xs text-dark-400 font-medium"> / month</span>
                            </div>
                            <ul className="space-y-3 mb-6 text-xs text-dark-300">
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    15+ DSA Algorithmic Pattern Modules
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Progress Tracking & Completion Heatmap
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Interactive Coding Compiler & Sandbox
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Curriculum Syllabus Wiki Explorer
                                </li>
                            </ul>
                        </div>
                        <button
                            disabled={loading || success}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSubscribe('basic');
                            }}
                            className={`w-full py-3 rounded-lg text-xs font-bold transition-all duration-200 mt-4 ${
                                selectedTier === 'basic'
                                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg'
                                    : 'bg-dark-800 hover:bg-dark-700 text-dark-200'
                            }`}
                        >
                            {loading && selectedTier === 'basic' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing Secure Checkout...
                                </span>
                            ) : success && selectedTier === 'basic' ? (
                                'Subscription Activated!'
                            ) : (
                                'Subscribe to Basic'
                            )}
                        </button>
                    </div>

                    {/* Premium Card */}
                    <div className={`p-6 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                        selectedTier === 'premium' 
                            ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                            : 'border-dark-850 bg-dark-950/40 hover:border-dark-700'
                    }`} onClick={() => setSelectedTier('premium')}>
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Premium Workspace</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">All-Inclusive</span>
                            </div>
                            <div className="mb-6">
                                <span className="text-3xl font-extrabold text-white font-display">$109</span>
                                <span className="text-xs text-dark-400 font-medium"> / month</span>
                            </div>
                            <ul className="space-y-3 mb-6 text-xs text-dark-300">
                                <li className="flex items-center gap-2 font-medium text-purple-400">
                                    <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Everything in Basic plan
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Interactive LaTeX Resume Builder & Editor
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    ATS Resume Scanner & Formatting Score
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    AI Technical, Behavioral, & System Design Interviews
                                </li>
                                <li className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    System Design Architecture Assessment Canvas
                                </li>
                            </ul>
                        </div>
                        <button
                            disabled={loading || success}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSubscribe('premium');
                            }}
                            className={`w-full py-3 rounded-lg text-xs font-bold transition-all duration-200 mt-4 ${
                                selectedTier === 'premium'
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                                    : 'bg-dark-800 hover:bg-dark-700 text-dark-200'
                            }`}
                        >
                            {loading && selectedTier === 'premium' ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing Secure Checkout...
                                </span>
                            ) : success && selectedTier === 'premium' ? (
                                'Subscription Activated!'
                            ) : (
                                'Subscribe to Premium'
                            )}
                        </button>
                    </div>

                </div>

                {/* Footer warning */}
                <div className="p-4 bg-dark-950 border-t border-dark-850 text-center flex-shrink-0 flex items-center justify-between px-6">
                    <span className="text-[10px] text-dark-450 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-5a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        SSL 256-bit encrypted checkout. Cancel anytime.
                    </span>
                    {user?.subscriptionTier !== 'none' && (
                        <button 
                            onClick={onClose}
                            className="text-[10px] font-bold text-dark-350 hover:text-white transition-colors"
                        >
                            Keep Trial
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SubscriptionModal;
