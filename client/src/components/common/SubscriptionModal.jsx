import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const SubscriptionModal = ({ isOpen, onClose, requiredTier = 'basic' }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [selectedTier, setSelectedTier] = useState(requiredTier);
    const [localUser, setLocalUser] = useState(user);

    // Payment Gateway States
    const [showGateway, setShowGateway] = useState(false);
    const [gatewayMethod, setGatewayMethod] = useState('card'); // 'card' | 'upi' | 'netbanking'
    const [gatewayStep, setGatewayStep] = useState('input'); // 'input' | 'otp' | 'processing' | 'success'
    
    // Form States
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [upiId, setUpiId] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [otp, setOtp] = useState('');
    const [mockPaymentId, setMockPaymentId] = useState('');

    useEffect(() => {
        setLocalUser(user);
    }, [user]);

    if (!isOpen) return null;

    const getPlanPrice = (tier) => {
        if (tier === 'day') return 19;
        if (tier === 'basic') return 79;
        return 109;
    };

    const handleOpenGateway = (tier) => {
        setSelectedTier(tier);
        setShowGateway(true);
        setGatewayStep('input');
        // Reset form inputs
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardName('');
        setUpiId('');
        setSelectedBank('');
        setOtp('');
    };

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        // Format as XXXX XXXX XXXX XXXX
        const matches = value.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length > 0) {
            setCardNumber(parts.join(' '));
        } else {
            setCardNumber(value);
        }
    };

    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
        } else {
            setCardExpiry(value);
        }
    };

    const handleProcessPayment = (e) => {
        e.preventDefault();
        
        if (gatewayMethod === 'card') {
            if (cardNumber.replace(/\s/g, '').length < 16) {
                alert('Please enter a valid 16-digit card number.');
                return;
            }
            if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
                alert('Please enter a valid expiry date (MM/YY).');
                return;
            }
            if (cardCvv.length < 3) {
                alert('Please enter a valid CVV.');
                return;
            }
            if (!cardName.trim()) {
                alert('Please enter the cardholder name.');
                return;
            }
            // Transition to OTP verification step
            setGatewayStep('otp');
        } else if (gatewayMethod === 'upi') {
            if (!upiId.includes('@') || upiId.length < 5) {
                alert('Please enter a valid UPI ID (e.g. name@upi).');
                return;
            }
            // UPI goes straight to processing
            simulateTransaction();
        } else if (gatewayMethod === 'netbanking') {
            if (!selectedBank) {
                alert('Please select a bank to proceed.');
                return;
            }
            // Netbanking goes straight to processing
            simulateTransaction();
        }
    };

    const handleOtpSubmit = (e) => {
        e.preventDefault();
        if (otp.length < 6) {
            alert('Please enter the 6-digit OTP code.');
            return;
        }
        simulateTransaction();
    };

    const simulateTransaction = async () => {
        setGatewayStep('processing');
        
        try {
            // Simulate payment verification delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Call actual backend subscription persistence API
            const response = await authAPI.subscribe(selectedTier);
            
            if (response.data?.success) {
                const updatedUser = response.data.data.user;
                // Update local storage user details
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Generate a real-looking transaction ID
                const randomId = 'pay_' + Math.random().toString(36).substring(2, 11).toUpperCase();
                setMockPaymentId(randomId);
                
                setGatewayStep('success');
                setSuccess(true);
                
                // Refresh page after delay to reload Auth Context and activate UI features
                setTimeout(() => {
                    window.location.reload();
                }, 2500);
            } else {
                throw new Error('Server subscription update failed.');
            }
        } catch (error) {
            console.error('Payment gateway sync error:', error);
            alert('Backend activation failed. Please check server connections and try again.');
            setGatewayStep('input');
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark-950/85 backdrop-blur-md p-4">
            <div className="w-full max-w-4xl bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl animate-tab-switch max-h-[95vh] flex flex-col relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-dark-400 hover:text-white transition-colors z-20 cursor-pointer p-1.5 hover:bg-dark-800 rounded-lg"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {!showGateway ? (
                    <>
                        {/* Header */}
                        <div className="p-6 md:p-8 text-center border-b border-dark-800 bg-gradient-to-b from-dark-950/40 to-transparent flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center mx-auto mb-4 text-primary-400 font-bold text-xl">
                                ₹
                            </div>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
                                Activate Your Developer Workstation
                            </h2>
                            <p className="text-xs md:text-sm text-dark-350 max-w-xl mx-auto mt-2 leading-relaxed">
                                Subscribe to one of our premium tiers to unlock complete workspace access and synchronize progress.
                            </p>
                        </div>

                        {/* Plan Cards Container */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 grid md:grid-cols-3 gap-6 items-stretch scrollbar-thin">
                            
                            {/* Day Pass Card */}
                            <div className={`p-6 rounded-xl border flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                                selectedTier === 'day' 
                                    ? 'border-emerald-500 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                                    : 'border-dark-850 bg-dark-950/40 hover:border-dark-700'
                            }`} onClick={() => setSelectedTier('day')}>
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white">Daily Pass</h3>
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">All Features</span>
                                    </div>
                                    <div className="mb-6">
                                        <span className="text-3xl font-extrabold text-white font-display">₹19</span>
                                        <span className="text-xs text-dark-400 font-medium"> / day</span>
                                    </div>
                                    <ul className="space-y-3 mb-6 text-xs text-dark-300">
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Complete Access to All Features for 24 Hours
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            DSA sandbox & system design canvas
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            AI technical & system interviews
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenGateway('day');
                                    }}
                                    className="w-full py-3 rounded-lg text-xs font-bold transition-all duration-200 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer"
                                >
                                    Activate Day Pass (₹19)
                                </button>
                            </div>

                            {/* Basic Card - DSA & System Design */}
                            <div className={`p-6 rounded-xl border flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                                selectedTier === 'basic' 
                                    ? 'border-primary-500 bg-primary-500/5 shadow-[0_0_20px_rgba(124,58,237,0.15)]' 
                                    : 'border-dark-850 bg-dark-950/40 hover:border-dark-700'
                            }`} onClick={() => setSelectedTier('basic')}>
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white">Basic Pass</h3>
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-dark-800 text-dark-300 font-mono">DSA & Systems</span>
                                    </div>
                                    <div className="mb-6">
                                        <span className="text-3xl font-extrabold text-white font-display">₹79</span>
                                        <span className="text-xs text-dark-400 font-medium"> / month</span>
                                    </div>
                                    <ul className="space-y-3 mb-6 text-xs text-dark-300">
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Interactive DSA Coding Compiler & Sandbox
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            15+ Algorithmic Pattern Modules
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            System Design Architecture Canvas
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenGateway('basic');
                                    }}
                                    className="w-full py-3 rounded-lg text-xs font-bold transition-all duration-200 mt-4 bg-primary-500 hover:bg-primary-600 text-white shadow-lg cursor-pointer"
                                >
                                    Activate Basic Plan (₹79)
                                </button>
                            </div>

                            {/* Premium Card - AI Workspace */}
                            <div className={`p-6 rounded-xl border flex flex-col justify-between transition-all duration-300 cursor-pointer ${
                                selectedTier === 'premium' 
                                    ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                                    : 'border-dark-850 bg-dark-950/40 hover:border-dark-700'
                            }`} onClick={() => setSelectedTier('premium')}>
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white">Premium Pass</h3>
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">All AI Tools</span>
                                    </div>
                                    <div className="mb-6">
                                        <span className="text-3xl font-extrabold text-white font-display">₹109</span>
                                        <span className="text-xs text-dark-400 font-medium"> / month</span>
                                    </div>
                                    <ul className="space-y-3 mb-6 text-xs text-dark-300">
                                        <li className="flex items-center gap-2 font-medium text-purple-400">
                                            <svg className="w-4 h-4 text-purple-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Includes Everything in Basic Plan
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            LaTeX Resume Builder & ATS Scanner
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-[#39d353] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                            AI Technical Mock Interviews
                                        </li>
                                    </ul>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenGateway('premium');
                                    }}
                                    className="w-full py-3 rounded-lg text-xs font-bold transition-all duration-200 mt-4 bg-purple-600 hover:bg-purple-700 text-white shadow-lg cursor-pointer"
                                >
                                    Activate Premium Plan (₹109)
                                </button>
                            </div>

                        </div>

                        {/* Footer info */}
                        <div className="p-4 bg-dark-950 border-t border-dark-850 text-center flex-shrink-0 flex items-center justify-between px-6">
                            <span className="text-[10px] text-dark-450 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-5a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Secure 256-bit SSL checkout processing. Cancel anytime.
                            </span>
                            {user?.subscriptionTier !== 'none' && (
                                <button 
                                    onClick={onClose}
                                    className="text-[10px] font-bold text-dark-350 hover:text-white transition-colors cursor-pointer"
                                >
                                    Keep Trial
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    /* Razorpay Secure Checkout Panel Overlay */
                    <div className="flex-1 flex flex-col md:flex-row min-h-[450px] bg-dark-950 text-white select-none">
                        
                        {/* Gateway Left Sidebar (Payment Methods Selection) */}
                        <div className="w-full md:w-64 bg-dark-900 border-r border-dark-850 p-6 flex flex-col justify-between flex-shrink-0">
                            <div>
                                {/* Razorpay simulated header */}
                                <div className="flex items-center gap-2 mb-8 border-b border-dark-800 pb-4">
                                    <div className="w-8 h-8 rounded-lg bg-[#3397f3] flex items-center justify-center text-white font-extrabold text-sm">
                                        R
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#3397f3]">Razorpay Secure</span>
                                        <span className="text-[9px] text-dark-400 font-semibold">Merchant: CodeForge.dev</span>
                                    </div>
                                </div>

                                <span className="text-[10px] font-bold text-dark-400 uppercase tracking-wider block mb-3">
                                    Select Payment Method
                                </span>

                                <div className="space-y-2">
                                    <button
                                        disabled={gatewayStep === 'processing' || gatewayStep === 'success'}
                                        onClick={() => setGatewayMethod('card')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                                            gatewayMethod === 'card' 
                                                ? 'bg-[#3397f3]/10 border border-[#3397f3]/30 text-[#3397f3]' 
                                                : 'border border-dark-800 hover:border-dark-700 text-dark-300'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Credit/Debit Card
                                    </button>

                                    <button
                                        disabled={gatewayStep === 'processing' || gatewayStep === 'success'}
                                        onClick={() => setGatewayMethod('upi')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                                            gatewayMethod === 'upi' 
                                                ? 'bg-[#3397f3]/10 border border-[#3397f3]/30 text-[#3397f3]' 
                                                : 'border border-dark-800 hover:border-dark-700 text-dark-300'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        UPI / QR Code
                                    </button>

                                    <button
                                        disabled={gatewayStep === 'processing' || gatewayStep === 'success'}
                                        onClick={() => setGatewayMethod('netbanking')}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                                            gatewayMethod === 'netbanking' 
                                                ? 'bg-[#3397f3]/10 border border-[#3397f3]/30 text-[#3397f3]' 
                                                : 'border border-dark-800 hover:border-dark-700 text-dark-300'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Netbanking
                                    </button>
                                </div>
                            </div>

                            {/* Info Block */}
                            <div className="mt-8">
                                <div className="text-center bg-dark-950 border border-dark-850 p-4 rounded-xl">
                                    <span className="text-[10px] text-dark-400 block mb-1">TOTAL AMOUNT DUE</span>
                                    <span className="text-2xl font-extrabold text-white">₹{getPlanPrice(selectedTier)}.00</span>
                                </div>
                                <button
                                    onClick={() => setShowGateway(false)}
                                    className="w-full text-center text-[10px] text-dark-450 hover:text-white transition-colors mt-4 block cursor-pointer"
                                >
                                    ← Back to plans list
                                </button>
                            </div>
                        </div>

                        {/* Gateway Right Workspace (Method Interactive Screen) */}
                        <div className="flex-grow p-6 md:p-8 flex flex-col justify-center items-center scrollbar-thin">
                            
                            {/* Step: CARD / UPI / NETBANKING INPUT */}
                            {gatewayStep === 'input' && (
                                <div className="w-full max-w-md animate-tab-switch">
                                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[#3397f3]" />
                                        {gatewayMethod === 'card' && 'Enter Debit / Credit Card'}
                                        {gatewayMethod === 'upi' && 'Instant Pay via UPI'}
                                        {gatewayMethod === 'netbanking' && 'Choose Bank Login'}
                                    </h3>

                                    <form onSubmit={handleProcessPayment} className="space-y-4">
                                        {/* Card Input Form */}
                                        {gatewayMethod === 'card' && (
                                            <>
                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-dark-400 tracking-wider mb-1">
                                                        Card Number
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="4111 1111 1111 1111"
                                                            value={cardNumber}
                                                            onChange={handleCardNumberChange}
                                                            className="w-full px-3.5 py-2.5 rounded-xl border border-dark-800 bg-dark-900 text-white font-mono text-sm tracking-widest focus:outline-none focus:ring-1 focus:ring-[#3397f3]"
                                                            required
                                                        />
                                                        <span className="absolute right-3.5 top-3 text-[10px] font-bold text-dark-500 font-mono tracking-wider">
                                                            {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MC' : 'CARD'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[9px] uppercase font-bold text-dark-400 tracking-wider mb-1">
                                                            Expiry Date
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="MM/YY"
                                                            value={cardExpiry}
                                                            onChange={handleExpiryChange}
                                                            className="w-full px-3.5 py-2.5 rounded-xl border border-dark-800 bg-dark-900 text-white text-sm tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-[#3397f3]"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] uppercase font-bold text-dark-400 tracking-wider mb-1">
                                                            CVV / Card Code
                                                        </label>
                                                        <input
                                                            type="password"
                                                            placeholder="•••"
                                                            maxLength={3}
                                                            value={cardCvv}
                                                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                                            className="w-full px-3.5 py-2.5 rounded-xl border border-dark-800 bg-dark-900 text-white text-sm tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-[#3397f3]"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[9px] uppercase font-bold text-dark-400 tracking-wider mb-1">
                                                        Cardholder Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="Tushar Seth"
                                                        value={cardName}
                                                        onChange={(e) => setCardName(e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-dark-800 bg-dark-900 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#3397f3]"
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* UPI QR & ID Entry */}
                                        {gatewayMethod === 'upi' && (
                                            <div className="flex flex-col items-center text-center space-y-5">
                                                {/* Simulated QR Code */}
                                                <div className="p-3 bg-white rounded-2xl flex flex-col items-center">
                                                    {/* Custom SVG QR Code mockup */}
                                                    <svg className="w-40 h-40 text-dark-950" viewBox="0 0 100 100" fill="currentColor">
                                                        <path d="M0,0h40v40h-40z M10,10v20h20v-20z" />
                                                        <path d="M60,0h40v40h-40z M70,10v20h20v-20z" />
                                                        <path d="M0,60h40v40h-40z M10,70v20h20v-20z" />
                                                        {/* QR Inner noise dots */}
                                                        <rect x="45" y="5" width="8" height="8" />
                                                        <rect x="45" y="20" width="8" height="8" />
                                                        <rect x="5" y="45" width="8" height="8" />
                                                        <rect x="20" y="45" width="8" height="8" />
                                                        <rect x="75" y="45" width="12" height="12" />
                                                        <rect x="45" y="60" width="10" height="10" />
                                                        <rect x="65" y="65" width="10" height="10" />
                                                        <rect x="55" y="80" width="12" height="12" />
                                                        <rect x="80" y="80" width="15" height="15" />
                                                    </svg>
                                                    <span className="text-[9px] font-bold text-dark-800 tracking-wider mt-2 font-mono">
                                                        codeforge@upi | ₹{getPlanPrice(selectedTier)}.00
                                                    </span>
                                                </div>

                                                <span className="text-xs text-dark-400 max-w-xs leading-normal">
                                                    Scan the QR Code using Google Pay, PhonePe, Paytm, or enter your UPI ID below to pay securely:
                                                </span>

                                                <div className="w-full">
                                                    <input
                                                        type="text"
                                                        placeholder="username@upi"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                        className="w-full px-3.5 py-2.5 rounded-xl border border-dark-800 bg-dark-900 text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#3397f3] text-center"
                                                        required={gatewayMethod === 'upi'}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Netbanking bank selector grid */}
                                        {gatewayMethod === 'netbanking' && (
                                            <div className="space-y-5">
                                                <span className="text-xs text-dark-455 block">
                                                    Select one of the popular Indian banks below:
                                                </span>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { id: 'sbi', name: 'State Bank of India' },
                                                        { id: 'hdfc', name: 'HDFC Bank' },
                                                        { id: 'icici', name: 'ICICI Bank' },
                                                        { id: 'axis', name: 'Axis Bank' }
                                                    ].map((bank) => (
                                                        <button
                                                            key={bank.id}
                                                            type="button"
                                                            onClick={() => setSelectedBank(bank.id)}
                                                            className={`p-3 rounded-xl border font-bold text-[10px] tracking-tight text-center transition-all ${
                                                                selectedBank === bank.id 
                                                                    ? 'bg-[#3397f3]/10 border-[#3397f3] text-white' 
                                                                    : 'border-dark-850 hover:border-dark-750 text-dark-350 bg-dark-900/60'
                                                            }`}
                                                        >
                                                            {bank.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            className="w-full py-3.5 rounded-xl bg-[#3397f3] hover:bg-[#2881d1] text-white font-bold text-xs tracking-wider transition-all duration-150 mt-6 shadow-lg shadow-[#3397f3]/20 cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Pay ₹{getPlanPrice(selectedTier)}.00
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Step: OTP ENTRY */}
                            {gatewayStep === 'otp' && (
                                <div className="w-full max-w-sm text-center animate-tab-switch">
                                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0-6v2m0-5a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-md font-bold text-white mb-2">
                                        3D Secure Authentication
                                    </h3>
                                    <p className="text-xs text-dark-400 mb-6 leading-relaxed">
                                        Please enter the 6-digit One-Time Password (OTP) sent to your mobile device registered with your bank card ending in **{cardNumber.slice(-4)}.
                                    </p>

                                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="123456"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full px-4 py-3 rounded-xl border border-dark-800 bg-dark-900 text-white font-mono text-center tracking-[1em] text-lg focus:outline-none focus:ring-1 focus:ring-[#3397f3]"
                                            required
                                        />
                                        
                                        <button
                                            type="submit"
                                            className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs tracking-wider transition-all duration-150 cursor-pointer shadow-lg shadow-primary-500/20"
                                        >
                                            Submit OTP Code
                                        </button>

                                        <span className="text-[10px] text-dark-500 block mt-3">
                                            For local testing, type any 6 digits (e.g. 123456)
                                        </span>
                                    </form>
                                </div>
                            )}

                            {/* Step: PROCESSING */}
                            {gatewayStep === 'processing' && (
                                <div className="text-center animate-fade-in">
                                    <div className="w-16 h-16 border-4 border-t-[#3397f3] border-dark-800 rounded-full animate-spin mx-auto mb-6" />
                                    <h3 className="text-base font-bold text-white mb-2">
                                        Verifying Transaction
                                    </h3>
                                    <p className="text-xs text-dark-400 max-w-xs mx-auto leading-relaxed">
                                        We are securely communicating with your banking institution. Please do not close or refresh this tab.
                                    </p>
                                </div>
                            )}

                            {/* Step: SUCCESS RECEIPT */}
                            {gatewayStep === 'success' && (
                                <div className="w-full max-w-md bg-dark-900 border border-dark-850 p-6 rounded-2xl shadow-xl text-center animate-scale-up">
                                    <div className="w-12 h-12 rounded-full bg-[#39d353]/15 text-[#39d353] flex items-center justify-center mx-auto mb-4 border border-[#39d353]/30">
                                        <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-extrabold text-white mb-1">
                                        Payment Completed!
                                    </h3>
                                    <p className="text-xs text-dark-400 mb-6">
                                        Your Developer Workstation is now fully unlocked.
                                    </p>

                                    <div className="border-t border-b border-dark-800 py-4 mb-6 text-left space-y-2.5 font-mono text-[10px] text-dark-350">
                                        <div className="flex justify-between">
                                            <span>TRANSACTION ID</span>
                                            <span className="font-bold text-white">{mockPaymentId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>TIER ACTIVATED</span>
                                            <span className="font-bold text-[#3397f3] uppercase">{selectedTier} Tier</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>AMOUNT PAID</span>
                                            <span className="font-bold text-[#39d353]">₹{getPlanPrice(selectedTier)}.00</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>PAYMENT PROCESSOR</span>
                                            <span className="font-bold text-white">Razorpay Secure</span>
                                        </div>
                                    </div>

                                    <span className="text-[10px] text-primary-400 font-bold block animate-pulse">
                                        Activating workspace access, reloading terminal...
                                    </span>
                                </div>
                            )}

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default SubscriptionModal;
