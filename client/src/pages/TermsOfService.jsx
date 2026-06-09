import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full py-16 px-4 bg-dark-50 dark:bg-dark-950/40 relative font-sans">
            {/* Design accents */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-48 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-3xl mx-auto bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 rounded-3xl p-8 md:p-12 shadow-2xl relative z-10 text-dark-800 dark:text-dark-200">
                
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-bold text-dark-500 hover:text-primary-500 dark:text-dark-400 dark:hover:text-primary-400 transition-colors mb-8 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Go Back
                </button>

                <h1 className="text-3xl font-extrabold text-dark-900 dark:text-white mb-2 tracking-tight">
                    Terms of Service & AI Usage Agreement
                </h1>
                <p className="text-xs text-dark-400 dark:text-dark-500 mb-8">
                    Last Updated: June 9, 2026
                </p>

                <div className="space-y-6 text-sm leading-relaxed text-dark-600 dark:text-dark-300">
                    
                    {/* Crucial Section: AI Token Policy */}
                    <div className="p-5 rounded-2xl border border-yellow-600/30 bg-yellow-600/5 text-yellow-950 dark:text-yellow-100/90">
                        <h2 className="text-base font-extrabold text-yellow-800 dark:text-yellow-400 mb-2">
                            Critical Disclosure: AI Keys & Token Requirements
                        </h2>
                        <p className="mb-3">
                            This platform provides visual templates, workspace features, and client-side interfaces for resume editing, ATS scanning, and interview practice. 
                            <strong> We do not provide, fund, or distribute AI model API keys or token credits.</strong>
                        </p>
                        <p className="font-semibold">
                            To use any AI-powered utility (including ATS Reviewer, AI Mock Interviews, and automated resume feedback):
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>You must obtain your own private API Key directly from Google (Gemini API), OpenAI, or Groq.</li>
                            <li>You must enter and save this API key in your Profile Settings panel inside this application.</li>
                            <li>Any usage charges incurred from making calls to the respective AI providers are billed directly by those third-party providers. We bear no liability for charges on your API keys.</li>
                        </ul>
                    </div>

                    <section>
                        <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-3">
                            1. Agreement to Terms
                        </h2>
                        <p>
                            By registering an account, purchasing a subscription, or accessing any service on this platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, you are prohibited from using the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-3">
                            2. Subscription Billing and Refunds
                        </h2>
                        <p>
                            We offer digital passes (Daily, Monthly, and Premium Tiers) to unlock the premium workstation layouts, progress trackers, and compilers. 
                        </p>
                        <p className="mt-2">
                            All subscription fees are processed securely. Because digital access and feature unlocks are instantly provisioned upon payment signature verification, 
                            <strong> all purchases are strictly final and non-refundable.</strong> Subscriptions do not include, package, or guarantee any AI token allowances.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-3">
                            3. API Keys and Key Security
                        </h2>
                        <p>
                            Your API Keys are saved locally on the database and sent directly to the model endpoints from your sessions. You are solely responsible for maintaining the confidentiality and usage of any credentials you configure. We recommend setting appropriate billing limits on your Google Gemini or OpenAI developer consoles to prevent unexpected costs.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-dark-900 dark:text-white mb-3">
                            4. Limitation of Liability
                        </h2>
                        <p>
                            Under no circumstances shall this platform, its developers, or its affiliates be liable for any direct, indirect, incidental, or consequential damages arising from the use of, or inability to use, the platform tools, API failures, service interruptions, or charges incurred on your third-party API accounts.
                        </p>
                    </section>

                </div>

                <div className="mt-12 pt-8 border-t border-dark-200 dark:border-dark-800 text-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="py-3 px-8 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs tracking-wider transition-all cursor-pointer shadow-lg shadow-primary-500/20"
                    >
                        I Accept and Understand
                    </button>
                </div>

            </div>
        </div>
    );
};

export default TermsOfService;
