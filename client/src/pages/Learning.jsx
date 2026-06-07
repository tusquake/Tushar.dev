import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { learningResourcesAPI, learningAPI, dsaProgressAPI } from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { TOPICS, ALL_QUESTIONS } from '../data/dsaQuestions';

// Sample resources to ensure visibility of key repositories
const sampleResources = [
    {
        _id: 'sample-1',
        title: 'Backend Concepts',
        description: 'Comprehensive guide and examples for backend development concepts.',
        category: 'backend',
        url: 'https://github.com/tusquake/Backend-Concepts',
        type: 'repository'
    },
    {
        _id: 'sample-2',
        title: 'DSA PatternWise',
        description: 'Data Structures and Algorithms problems categorized by patterns.',
        category: 'dsa',
        url: 'https://github.com/tusquake/DSA-PatternWise',
        type: 'repository'
    },
    {
        _id: 'sample-3',
        title: 'Low-Level Design',
        description: 'Standard LLD problems and solutions with class diagrams and design patterns.',
        category: 'lld',
        url: 'https://github.com/tusquake/Low-Level-Design',
        type: 'repository'
    },
    {
        _id: 'sample-4',
        title: 'High-Level Design',
        description: 'HLD concepts, system design patterns, and case studies.',
        category: 'hld',
        url: 'https://github.com/tusquake/High-Level-Design',
        type: 'repository'
    }
];

const getTopicIcon = (topicId) => {
    const icons = {
        arr: (
            <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
        tp: (
            <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
        sw: (
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        bs: (
            <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
        ll: (
            <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        ),
        stk: (
            <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
            </svg>
        ),
        q: (
            <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
        ),
        bt: (
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
        ),
        bst: (
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        heap: (
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
        ),
        bt2: (
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
        ),
        str: (
            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
        mat: (
            <svg className="w-5 h-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 10h16M4 15h16M10 4v16M15 4v16" />
            </svg>
        ),
        bit: (
            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V21h-2v-3.3a5 5 0 00-3.536 0z" />
            </svg>
        ),
        iv: (
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        gr: (
            <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        math: (
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        sort: (
            <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
        ),
        bfs: (
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6.578M12 7a5 5 0 11-5 5" />
            </svg>
        ),
        rec: (
            <svg className="w-5 h-5 text-orange-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6.578M12 7a5 5 0 11-5 5" />
            </svg>
        ),
        design: (
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
        pre: (
            <svg className="w-5 h-5 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    };
    return icons[topicId] || null;
};

const Learning = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const [resources, setResources] = useState([]);
    const [learningTopics, setLearningTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Tab switching
    const [activeSection, setActiveSection] = useState('resources'); // 'resources' or 'dsa'
    const [activeCategory, setActiveCategory] = useState('all');

    // DSA Practice Sheet States
    const [dsaSearch, setDsaSearch] = useState('');
    const [dsaDiffFilter, setDsaDiffFilter] = useState('All');
    const [expandedTopics, setExpandedTopics] = useState({
        arr: true,
        tp: true,
        sw: true
    });
    const [completedQuestions, setCompletedQuestions] = useState([]);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [syncStatus, setSyncStatus] = useState('local'); // 'local', 'syncing', 'synced', 'error'
    const [confirmReset, setConfirmReset] = useState(false);

    // Fetch resources and user roadmap topics
    useEffect(() => {
        fetchData();
    }, [isAuthenticated]);

    const fetchData = async () => {
        try {
            // Fetch public resources
            const resourcesRes = await learningResourcesAPI.getAll();
            const apiResources = resourcesRes.data.data || [];

            // Combine API resources with sample resources (avoiding duplicates by URL)
            const combinedResources = [...apiResources];
            sampleResources.forEach(sample => {
                if (!combinedResources.some(r => r.url === sample.url)) {
                    combinedResources.push(sample);
                }
            });

            setResources(combinedResources);

            // If authenticated, also fetch learning topics
            if (isAuthenticated) {
                const topicsRes = await learningAPI.getAll();
                setLearningTopics(topicsRes.data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            // Fallback to sample resources if API fails or returns error
            setResources(sampleResources);
        } finally {
            setLoading(false);
        }
    };

    // Load DSA Practice progress
    useEffect(() => {
        const loadDsaProgress = async () => {
            let localData = [];
            try {
                const stored = localStorage.getItem('dsa_completed_questions');
                if (stored) {
                    localData = JSON.parse(stored);
                }
            } catch (e) {
                console.error('Error reading local storage progress:', e);
            }

            if (isAuthenticated) {
                try {
                    setSyncStatus('syncing');
                    const res = await dsaProgressAPI.getProgress();
                    const dbData = res.data.completedQuestions || [];
                    
                    // Merge local and DB to avoid losing data
                    const merged = Array.from(new Set([...localData, ...dbData]));
                    setCompletedQuestions(merged);

                    // If local had unsynced changes, save them to DB
                    if (localData.some(id => !dbData.includes(id))) {
                        await dsaProgressAPI.updateProgress(merged);
                    }
                    setSyncStatus('synced');
                } catch (err) {
                    console.error('Error fetching DSA progress from database:', err);
                    setCompletedQuestions(localData);
                    setSyncStatus('error');
                }
            } else {
                setCompletedQuestions(localData);
                setSyncStatus('local');
            }
            setIsInitialLoad(false);
        };

        loadDsaProgress();
    }, [isAuthenticated]);

    // Save/Sync DSA progress when it changes
    useEffect(() => {
        if (isInitialLoad) return;

        // Save to localStorage immediately for fast UI
        localStorage.setItem('dsa_completed_questions', JSON.stringify(completedQuestions));

        // Sync to DB (debounced)
        if (isAuthenticated) {
            setSyncStatus('syncing');
            const timer = setTimeout(async () => {
                try {
                    await dsaProgressAPI.updateProgress(completedQuestions);
                    setSyncStatus('synced');
                } catch (err) {
                    console.error('Failed to sync progress to database:', err);
                    setSyncStatus('error');
                }
            }, 800); // 800ms debounce
            return () => clearTimeout(timer);
        } else {
            setSyncStatus('local');
        }
    }, [completedQuestions, isAuthenticated, isInitialLoad]);

    const categories = [
        { id: 'all', name: 'All Resources' },
        { id: 'dsa', name: 'DSA' },
        { id: 'hld', name: 'System Design' },
        { id: 'lld', name: 'LLD' },
        { id: 'backend', name: 'Backend' },
        { id: 'frontend', name: 'Frontend' },
        { id: 'devops', name: 'DevOps' },
    ];

    const filteredResources = activeCategory === 'all'
        ? resources
        : resources.filter(r => r.category === activeCategory);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'repository': return 'repo';
            case 'course': return 'course';
            case 'article': return 'article';
            case 'tutorial': return 'tutorial';
            case 'book': return 'book';
            default: return 'link';
        }
    };

    const TypeIcon = ({ type }) => {
        const icons = {
            repo: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
            course: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
            article: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
            tutorial: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
            book: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
            link: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        };
        return <div className="text-primary-500">{icons[type] || icons.link}</div>;
    };

    // DSA Practice stats calculations
    const totalQuestions = ALL_QUESTIONS.length;
    const doneCount = completedQuestions.length;
    const percentDone = totalQuestions ? Math.round((doneCount / totalQuestions) * 100) : 0;

    const easyQs = ALL_QUESTIONS.filter(q => q.d === 'Easy');
    const easyDone = easyQs.filter(q => completedQuestions.includes(q.gid)).length;

    const medQs = ALL_QUESTIONS.filter(q => q.d === 'Medium');
    const medDone = medQs.filter(q => completedQuestions.includes(q.gid)).length;

    const hardQs = ALL_QUESTIONS.filter(q => q.d === 'Hard');
    const hardDone = hardQs.filter(q => completedQuestions.includes(q.gid)).length;

    const toggleDsaQuestion = (gid) => {
        setCompletedQuestions(prev => {
            if (prev.includes(gid)) {
                return prev.filter(id => id !== gid);
            } else {
                return [...prev, gid];
            }
        });
    };

    const toggleTopicCollapse = (topicId) => {
        setExpandedTopics(prev => ({
            ...prev,
            [topicId]: !prev[topicId]
        }));
    };

    const handleResetProgress = () => {
        if (!confirmReset) {
            setConfirmReset(true);
            setTimeout(() => {
                setConfirmReset(false);
            }, 3000);
        } else {
            setCompletedQuestions([]);
            setConfirmReset(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    return (
        <div className="min-h-screen py-12 px-4 bg-dark-50 dark:bg-dark-950/20">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-10">
                    <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-6">
                        Learning Portal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-white mb-6">
                        Level Up Your Engineering Skills
                    </h1>
                    <p className="text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
                        Curated resource guides, low-level & high-level designs, and an interactive coding sheet to track your progress.
                    </p>
                </div>

                {/* Section Navigation Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex p-1 bg-dark-100 dark:bg-dark-850/80 backdrop-blur-md rounded-2xl border border-dark-200/50 dark:border-dark-800">
                        <button
                            onClick={() => setActiveSection('resources')}
                            className={`px-6 py-2.5 rounded-xl font-display font-semibold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                                activeSection === 'resources'
                                    ? 'bg-white dark:bg-dark-900 text-primary-600 dark:text-primary-400 shadow-md'
                                    : 'text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-200'
                            }`}
                        >
                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Learning Resources
                        </button>
                        <button
                            onClick={() => setActiveSection('dsa')}
                            className={`px-6 py-2.5 rounded-xl font-display font-semibold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                                activeSection === 'dsa'
                                    ? 'bg-white dark:bg-dark-900 text-primary-600 dark:text-primary-400 shadow-md'
                                    : 'text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-200'
                            }`}
                        >
                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            DSA Practice Sheet
                        </button>
                    </div>
                </div>

                {/* --- RENDER Tab 1: Resources --- */}
                {activeSection === 'resources' && (
                    <>
                        {/* Category Filter */}
                        <div className="flex flex-wrap justify-center gap-3 mb-12">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                                        activeCategory === cat.id
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Resources Grid */}
                        {filteredResources.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                                {filteredResources.map((resource) => (
                                    <a
                                        key={resource._id}
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="card p-6 hover:scale-105 transition-transform duration-300 group block"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <TypeIcon type={getTypeIcon(resource.type)} />
                                            <span className="badge badge-primary text-xs capitalize">
                                                {resource.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2 group-hover:text-primary-500">
                                            {resource.title}
                                        </h3>
                                        {resource.description && (
                                            <p className="text-dark-500 dark:text-dark-400 text-sm mb-4">
                                                {resource.description}
                                            </p>
                                        )}
                                        <div className="flex items-center text-primary-500 text-sm font-medium">
                                            <span>Explore</span>
                                            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <svg className="w-16 h-16 mx-auto mb-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <h3 className="text-xl font-semibold text-dark-700 dark:text-dark-300 mb-2">
                                    No resources available yet
                                </h3>
                                <p className="text-dark-500 dark:text-dark-400">
                                    Check back soon for curated learning materials!
                                </p>
                            </div>
                        )}

                        {/* Quick Links Section */}
                        <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl p-8 md:p-12 text-center text-white mb-16">
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">
                                Want to Learn Together?
                            </h2>
                            <p className="text-white/80 mb-8 max-w-xl mx-auto">
                                Connect with me on GitHub to explore my open-source projects,
                                DSA solutions, and learning repositories.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="https://github.com/tusquake"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-white/90 transition-colors flex items-center shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                    </svg>
                                    View GitHub
                                </a>
                                <a
                                    href="https://leetcode.com/u/Tushar_Seth/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors flex items-center shadow-lg"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                                    </svg>
                                    LeetCode Profile
                                </a>
                            </div>
                        </div>

                        {/* User Section - Learning Tracker */}
                        {isAuthenticated && (
                            <div className="mt-16 border-t border-dark-200 dark:border-dark-800 pt-16">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-dark-900 dark:text-white font-display">
                                        My Learning Tracker
                                    </h2>
                                    <Link to="/dashboard" className="btn-primary text-sm font-semibold">
                                        Manage in Dashboard
                                    </Link>
                                </div>

                                {learningTopics.length > 0 ? (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {learningTopics.slice(0, 6).map((topic) => (
                                            <Card key={topic._id} className="p-4 bg-white/40 dark:bg-dark-900/40 border border-dark-200/50 dark:border-dark-800">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-dark-900 dark:text-white">
                                                        {topic.title}
                                                    </h4>
                                                    <span className={`badge text-xs uppercase ${topic.status === 'completed' ? 'badge-success' :
                                                        topic.status === 'in-progress' ? 'badge-warning' :
                                                            'badge-gray'
                                                        }`}>
                                                        {topic.status.replace('-', ' ')}
                                                    </span>
                                                </div>
                                                {topic.description && (
                                                    <p className="text-sm text-dark-500 dark:text-dark-400">
                                                        {topic.description}
                                                    </p>
                                                )}
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-8 text-center bg-white/40 dark:bg-dark-900/40">
                                        <p className="text-dark-500 dark:text-dark-400">
                                            No learning topics yet. Add them from the Dashboard.
                                        </p>
                                    </Card>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* --- RENDER Tab 2: DSA Sheet --- */}
                {activeSection === 'dsa' && (
                    <div className="animate-fade-in">
                        {/* DSA Header and Sync Banner */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-dark-900/40 border border-dark-200/60 dark:border-dark-800/80 mb-8 backdrop-blur-sm">
                            <div>
                                <h2 className="text-2xl font-bold font-display text-dark-900 dark:text-white flex items-center gap-2">
                                    <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    Ultimate DSA Interview Sheet
                                </h2>
                                <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                                    Pattern-based categorization of high-yield questions. No Graphs or Tries. Click titles to code.
                                </p>
                            </div>
                            
                            {/* Sync Status Badge */}
                            <div className="flex items-center self-start md:self-auto">
                                {syncStatus === 'synced' && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-200/30 dark:border-emerald-900/30">
                                        <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                        </svg>
                                        Cloud Synced
                                    </div>
                                )}
                                {syncStatus === 'syncing' && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-405 border border-primary-200/30 dark:border-primary-900/30">
                                        <svg className="animate-spin h-3.5 w-3.5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Syncing changes...
                                    </div>
                                )}
                                {syncStatus === 'local' && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border border-amber-200/30 dark:border-amber-900/30" title="Sign in to save your progress to the database">
                                        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                        </svg>
                                        Local Only (Log in to Sync)
                                    </div>
                                )}
                                {syncStatus === 'error' && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-200/30 dark:border-rose-900/30">
                                        <svg className="w-3.5 h-3.5 text-rose-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Connection Error (Saved Locally)
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Dashboard Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {/* Total Completion */}
                            <div className="col-span-2 md:col-span-2 p-5 rounded-2xl border border-dark-200/60 dark:border-dark-800/80 bg-gradient-to-br from-white to-dark-50 dark:from-dark-900 dark:to-dark-850 shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-all duration-300"></div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-dark-400 dark:text-dark-500 tracking-wider uppercase font-display">Total Progress</span>
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 uppercase">Overall</span>
                                </div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-3xl font-extrabold text-dark-900 dark:text-white font-display">
                                        {doneCount}/{totalQuestions}
                                    </span>
                                    <span className="text-sm font-semibold text-primary-500 dark:text-primary-400">
                                        ({percentDone}%)
                                    </span>
                                </div>
                                <div className="w-full bg-dark-200 dark:bg-dark-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-gradient-to-r from-primary-500 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${percentDone}%` }}></div>
                                </div>
                            </div>

                            {/* Easy Stats */}
                            <div className="p-5 rounded-2xl border border-dark-200/60 dark:border-dark-800/80 bg-white dark:bg-dark-900/40 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-dark-450 dark:text-dark-500 tracking-wider uppercase">Easy</span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                </div>
                                <div className="text-2xl font-extrabold text-dark-900 dark:text-white font-display">
                                    {easyDone}/{easyQs.length}
                                </div>
                                <span className="text-xs font-medium text-emerald-500 mt-2 block">
                                    {easyQs.length ? Math.round((easyDone / easyQs.length) * 100) : 0}% Complete
                                </span>
                            </div>

                            {/* Medium Stats */}
                            <div className="p-5 rounded-2xl border border-dark-200/60 dark:border-dark-800/80 bg-white dark:bg-dark-900/40 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-dark-450 dark:text-dark-500 tracking-wider uppercase">Medium</span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                </div>
                                <div className="text-2xl font-extrabold text-dark-900 dark:text-white font-display">
                                    {medDone}/{medQs.length}
                                </div>
                                <span className="text-xs font-medium text-amber-500 mt-2 block">
                                    {medQs.length ? Math.round((medDone / medQs.length) * 100) : 0}% Complete
                                </span>
                            </div>

                            {/* Hard Stats */}
                            <div className="p-5 rounded-2xl border border-dark-200/60 dark:border-dark-800/80 bg-white dark:bg-dark-900/40 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-dark-450 dark:text-dark-500 tracking-wider uppercase">Hard</span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                </div>
                                <div className="text-2xl font-extrabold text-dark-900 dark:text-white font-display">
                                    {hardDone}/{hardQs.length}
                                </div>
                                <span className="text-xs font-medium text-rose-500 mt-2 block">
                                    {hardQs.length ? Math.round((hardDone / hardQs.length) * 100) : 0}% Complete
                                </span>
                            </div>
                        </div>

                        {/* Controls Panel */}
                        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-dark-900/20 border border-dark-200/50 dark:border-dark-800/60 mb-6">
                            
                            {/* Search Box */}
                            <div className="relative flex-1 min-w-[260px] max-w-sm">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-dark-400 dark:text-dark-500">
                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search questions or topics..."
                                    value={dsaSearch}
                                    onChange={(e) => setDsaSearch(e.target.value)}
                                    className="w-full pl-10 pr-9 py-2 rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900/50 text-dark-950 dark:text-white placeholder-dark-405 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                                />
                                {dsaSearch && (
                                    <button
                                        onClick={() => setDsaSearch('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-dark-600 dark:hover:text-dark-200 cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Difficulty Filters */}
                            <div className="flex bg-dark-100 dark:bg-dark-850 p-0.5 rounded-xl border border-dark-200/50 dark:border-dark-800">
                                {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                                    <button
                                        key={diff}
                                        onClick={() => setDsaDiffFilter(diff)}
                                        className={`px-4.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                            dsaDiffFilter === diff
                                                ? 'bg-white dark:bg-dark-905 text-primary-600 dark:text-primary-400 shadow-sm font-bold'
                                                : 'text-dark-500 dark:text-dark-405 hover:text-dark-800 dark:hover:text-dark-200'
                                        }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>

                            {/* Helper Expand/Collapse and Reset Controls */}
                            <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            const allExp = {};
                                            TOPICS.forEach(t => { allExp[t.id] = true; });
                                            setExpandedTopics(allExp);
                                        }}
                                        className="px-3 py-1.5 rounded-lg border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-xs font-semibold text-dark-600 dark:text-dark-400 hover:text-primary-500 dark:hover:text-primary-400 hover:border-primary-500/50 transition-colors cursor-pointer flex items-center gap-1"
                                        title="Expand all"
                                    >
                                        <svg className="w-3.5 h-3.5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        Expand
                                    </button>
                                    <button
                                        onClick={() => setExpandedTopics({})}
                                        className="px-3 py-1.5 rounded-lg border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-xs font-semibold text-dark-600 dark:text-dark-400 hover:text-primary-500 dark:hover:text-primary-400 hover:border-primary-500/50 transition-colors cursor-pointer flex items-center gap-1.5"
                                        title="Collapse all"
                                    >
                                        <svg className="w-3.5 h-3.5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        Collapse
                                    </button>
                                </div>

                                <button
                                    onClick={handleResetProgress}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer border flex items-center gap-1.5 ${
                                        confirmReset
                                            ? 'bg-rose-500 border-rose-500 text-white animate-pulse'
                                            : 'bg-white dark:bg-dark-900 text-dark-600 dark:text-dark-400 border-dark-200 dark:border-dark-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-900/30'
                                    }`}
                                >
                                    {confirmReset ? (
                                        <>
                                            <svg className="w-3.5 h-3.5 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                            Confirm Reset?
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 6.578M12 7a5 5 0 11-5 5" />
                                            </svg>
                                            Reset Progress
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Question Topics Accordion Grid */}
                        <div className="space-y-4">
                            {TOPICS.map((topic) => {
                                // Filter questions inside this topic
                                const matchingQs = topic.qs.filter(q => {
                                    const matchesDiff = dsaDiffFilter === 'All' || q.d === dsaDiffFilter;
                                    const matchesSearch = !dsaSearch || 
                                        q.n.toLowerCase().includes(dsaSearch.toLowerCase()) ||
                                        topic.title.toLowerCase().includes(dsaSearch.toLowerCase());
                                    return matchesDiff && matchesSearch;
                                });

                                // Skip if no matching questions for this category
                                if (matchingQs.length === 0) return null;

                                const topicTotal = matchingQs.length;
                                const topicDone = matchingQs.filter(q => completedQuestions.includes(q.gid)).length;
                                const topicPct = topicTotal ? Math.round((topicDone / topicTotal) * 100) : 0;
                                const isExpanded = !!expandedTopics[topic.id];

                                return (
                                    <div 
                                        key={topic.id} 
                                        className="rounded-2xl border border-dark-200/60 dark:border-dark-800/80 bg-white dark:bg-dark-900/20 overflow-hidden shadow-sm transition-all duration-200"
                                    >
                                        {/* Accordion Head */}
                                        <div 
                                            onClick={() => toggleTopicCollapse(topic.id)}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-dark-50/50 dark:bg-dark-900/60 cursor-pointer user-select-none hover:bg-dark-100/40 dark:hover:bg-dark-850/60 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-dark-800 shadow-sm border border-dark-200/50 dark:border-dark-700/50">
                                                    {getTopicIcon(topic.id)}
                                                </span>
                                                <span className="font-bold text-base text-dark-900 dark:text-white font-display">
                                                    {topic.title}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-dark-200/60 dark:bg-dark-800 text-dark-600 dark:text-dark-400">
                                                    {topicDone}/{topicTotal} done
                                                </span>
                                            </div>

                                            {/* Topic Progress Bar & Collapse Chevron */}
                                            <div className="flex items-center gap-4 min-w-[200px] justify-between sm:justify-end">
                                                <div className="flex-1 max-w-[140px] bg-dark-200 dark:bg-dark-800 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                            topicPct === 100 
                                                                ? 'bg-emerald-500' 
                                                                : topicPct > 0 
                                                                ? 'bg-primary-500' 
                                                                : 'bg-dark-300 dark:bg-dark-700'
                                                        }`}
                                                        style={{ width: `${topicPct}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs text-dark-400 dark:text-dark-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </div>
                                        </div>

                                        {/* Accordion Body */}
                                        {isExpanded && (
                                            <div className="p-4 border-t border-dark-100 dark:border-dark-800 bg-dark-50/10 dark:bg-dark-950/5">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                                    {matchingQs.map((q) => {
                                                        const isDone = completedQuestions.includes(q.gid);
                                                        const url = `https://leetcode.com/problems/${q.slug}/`;
                                                        
                                                        return (
                                                            <div 
                                                                key={q.gid} 
                                                                className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${
                                                                    isDone 
                                                                        ? 'bg-dark-50/50 dark:bg-dark-900/10 border-dark-100 dark:border-dark-800/40 opacity-70' 
                                                                        : 'bg-white dark:bg-dark-900/40 border-dark-200/60 dark:border-dark-800/80 hover:border-primary-500/40 dark:hover:border-primary-505/30 hover:scale-[1.01] hover:shadow-sm'
                                                                }`}
                                                            >
                                                                {/* Custom Checkbox */}
                                                                <button
                                                                    onClick={() => toggleDsaQuestion(q.gid)}
                                                                    className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0 ${
                                                                        isDone
                                                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                                                                            : 'border-dark-300 dark:border-dark-700 hover:border-primary-500 bg-transparent'
                                                                    }`}
                                                                >
                                                                    {isDone && (
                                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </button>

                                                                {/* Question Index */}
                                                                <span className="text-xs font-mono text-dark-400 dark:text-dark-500 w-6 flex-shrink-0">
                                                                    #{q.gid}
                                                                </span>

                                                                {/* Question Name */}
                                                                <a 
                                                                    href={url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className={`text-sm font-medium flex-1 cursor-pointer transition-all duration-150 ${
                                                                        isDone 
                                                                            ? 'line-through text-dark-400 dark:text-dark-500 hover:text-primary-500' 
                                                                            : 'text-dark-800 dark:text-dark-200 hover:text-primary-500 dark:hover:text-primary-400 hover:underline'
                                                                    }`}
                                                                >
                                                                    {q.n}
                                                                </a>

                                                                {/* Difficulty Badge */}
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                                                                    q.d === 'Easy' 
                                                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
                                                                        : q.d === 'Medium'
                                                                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
                                                                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30'
                                                                }`}>
                                                                    {q.d}
                                                                </span>

                                                                {/* External Link */}
                                                                <a 
                                                                    href={url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="text-dark-400 hover:text-primary-500 dark:text-dark-500 dark:hover:text-primary-400 transition-colors p-1"
                                                                    title="Open on LeetCode"
                                                                >
                                                                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                    </svg>
                                                                </a>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Learning;
