import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, learningAPI, dsaProgressAPI, interviewAPI, resumeAPI, uploadAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';

const PRESET_AVATARS = [
    { name: 'Code Samurai', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=samurai&backgroundColor=b6e3f4' },
    { name: 'Byte Wizard', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=wizard&backgroundColor=c0aede' },
    { name: 'Data Knight', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=knight&backgroundColor=d1f4c9' },
    { name: 'Cyber Punk', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=punk&backgroundColor=ffdfd3' },
    { name: 'Robo Dev', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=dev&backgroundColor=ffd5ec' },
];

const THEME_COLORS = [
    { name: 'purple', label: 'Mystic Purple', class: 'from-purple-600 to-indigo-600 bg-purple-500 text-purple-400 border-purple-500/20 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' },
    { name: 'blue', label: 'Neon Blue', class: 'from-blue-600 to-cyan-500 bg-blue-500 text-blue-400 border-blue-500/20 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
    { name: 'emerald', label: 'Emerald Green', class: 'from-emerald-600 to-teal-500 bg-emerald-500 text-emerald-400 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' },
    { name: 'amber', label: 'Cyber Gold', class: 'from-amber-500 to-orange-500 bg-amber-500 text-amber-400 border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20' },
    { name: 'rose', label: 'Glitch Pink', class: 'from-rose-500 to-pink-500 bg-rose-500 text-rose-400 border-rose-500/20 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' },
];

const ACHIEVEMENT_LIST = [
    { id: 'welcome', name: 'First Byte', desc: 'Join CodeForge and begin your journey.', icon: '🚀', category: 'General' },
    { id: 'profile_customizer', name: 'Identity Forged', desc: 'Customize your profile designation, bio, and skills.', icon: '🎨', category: 'Profile' },
    { id: 'dsa_novice', name: 'DSA Initiate', desc: 'Complete your first DSA practice problem.', icon: '🎯', category: 'DSA' },
    { id: 'dsa_adept', name: 'DSA Adept', desc: 'Mark 5 DSA questions as completed.', icon: '⚔️', category: 'DSA' },
    { id: 'dsa_master', name: 'DSA Archmage', desc: 'Solve 15 DSA questions. Master of logic.', icon: '👑', category: 'DSA' },
    { id: 'topic_scholar', name: 'Roadmap Scholar', desc: 'Finish at least 3 topics on your study roadmap.', icon: '📚', category: 'Roadmap' },
    { id: 'resume_craftsman', name: 'Resume Craftsman', desc: 'Build and save your custom professional resume.', icon: '📄', category: 'Resume' },
    { id: 'interview_novice', name: 'AI Interviewee', desc: 'Finish 1 Mock AI Interview session.', icon: '🤖', category: 'Interview' },
    { id: 'interview_veteran', name: 'System Consultant', desc: 'Complete 3 Mock AI Interview sessions.', icon: '🧠', category: 'Interview' },
];

const getLevelTitle = (lvl) => {
    if (lvl <= 1) return 'Syntax Apprentice';
    if (lvl === 2) return 'Logic Squire';
    if (lvl === 3) return 'Byte Crusader';
    if (lvl === 4) return 'Stack Ranger';
    if (lvl === 5) return 'MERN Knight';
    if (lvl <= 7) return 'Algorithm Master';
    if (lvl <= 10) return 'System Architect';
    return 'Cloud Archmage';
};

const renderAchievementIcon = (id, sizeClass = "w-7 h-7 sm:w-8 sm:h-8") => {
    const iconClass = `${sizeClass} text-primary-500 transition-transform duration-500 group-hover:scale-110`;
    switch (id) {
        case 'welcome':
            return (
                <svg className={`${iconClass} animate-[bounce_2s_infinite]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            );
        case 'profile_customizer':
            return (
                <svg className={`${iconClass} animate-[pulse_2.5s_infinite]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            );
        case 'dsa_novice':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <circle cx="12" cy="12" r="6" strokeWidth="2" />
                    <circle cx="12" cy="12" r="2" strokeWidth="2" fill="currentColor" />
                </svg>
            );
        case 'dsa_adept':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            );
        case 'dsa_master':
            return (
                <svg className={`${iconClass} animate-[bounce_1.5s_infinite]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
            );
        case 'topic_scholar':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            );
        case 'resume_craftsman':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        case 'interview_novice':
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            );
        case 'interview_veteran':
            return (
                <svg className={`${iconClass} animate-[pulse_2s_infinite]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            );
        default:
            return (
                <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                </svg>
            );
    }
};

const renderRankBadge = (index) => {
    if (index === 0) {
        return (
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-dark-900 font-extrabold flex items-center justify-center text-xs shadow-md shadow-amber-500/20">
                1st
            </span>
        );
    }
    if (index === 1) {
        return (
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-dark-900 font-extrabold flex items-center justify-center text-xs shadow-md shadow-slate-400/20">
                2nd
            </span>
        );
    }
    if (index === 2) {
        return (
            <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-amber-800/20">
                3rd
            </span>
        );
    }
    return (
        <span className="w-8 text-center font-display font-extrabold text-sm text-dark-500 dark:text-dark-400">
            #{index + 1}
        </span>
    );
};

const Profile = () => {
    const navigate = useNavigate();
    const { user, refreshUser, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, edit, leaderboard, achievements
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [toast, setToast] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast('File size should be less than 5MB');
            return;
        }

        setUploadingImage(true);
        try {
            const res = await uploadAPI.uploadImage(file);
            if (res.data.success) {
                const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const serverOrigin = apiBaseUrl.replace('/api', '');
                const fullImageUrl = `${serverOrigin}${res.data.data.imageUrl}`;
                
                setFormData(prev => ({ ...prev, avatar: fullImageUrl }));
                showToast('Image uploaded successfully!');
            }
        } catch (error) {
            console.error('Image upload failed:', error);
            showToast(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };
    
    // Detailed stats
    const [stats, setStats] = useState({
        dsaSolved: 0,
        topicsCompleted: 0,
        interviewsTaken: 0,
        resumesBuilt: 0,
        activities: [],
    });

    // Customizable Form State
    const [formData, setFormData] = useState({
        title: '',
        bio: '',
        location: '',
        targetRole: '',
        skills: [],
        socials: { github: '', linkedin: '', twitter: '', website: '', leetcode: '' },
        themeColor: 'purple',
        avatar: '',
        widgets: { showStats: true, showAchievements: true, showActivity: true, showSkills: true }
    });

    // Skill inputs
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState(50);

    useEffect(() => {
        if (user && !isInitialized) {
            setFormData({
                title: user.title || 'Software Explorer',
                bio: user.bio || 'Learning, coding, and building cool things.',
                location: user.location || '',
                targetRole: user.targetRole || '',
                skills: user.skills || [],
                socials: {
                    github: user.socials?.github || '',
                    linkedin: user.socials?.linkedin || '',
                    twitter: user.socials?.twitter || '',
                    website: user.socials?.website || '',
                    leetcode: user.socials?.leetcode || '',
                },
                themeColor: user.themeColor || 'purple',
                avatar: user.avatar || PRESET_AVATARS[0].url,
                widgets: user.widgets || { showStats: true, showAchievements: true, showActivity: true, showSkills: true }
            });
            setIsInitialized(true);
            fetchData();
        }
    }, [user, isInitialized]);

    const fetchData = async () => {
        setLoading(true);
        // Safety timeout to prevent the loader from hanging forever
        const safetyTimeout = setTimeout(() => {
            setLoading(false);
        }, 4000);

        try {
            // Fetch stats from various endpoints and refresh the user context to grab latest level/XP
            const [topicsRes, dsaRes, activitiesRes, interviewRes, resumeRes, leaderboardRes, updatedUser] = await Promise.all([
                learningAPI.getAll(),
                dsaProgressAPI.getProgress(),
                learningAPI.getActivityHistory(),
                interviewAPI.getAll(),
                resumeAPI.get(),
                authAPI.getLeaderboard(),
                refreshUser()
            ]);

            const topics = topicsRes.data.data || [];
            const completedTopicsCount = topics.filter(t => t.status === 'completed').length;
            const completedDsaCount = dsaRes.data.completedQuestions?.length || 0;
            const interviewCount = interviewRes.data.data?.length || 0;
            const hasResume = !!resumeRes.data.data;

            setStats({
                dsaSolved: completedDsaCount,
                topicsCompleted: completedTopicsCount,
                interviewsTaken: interviewCount,
                resumesBuilt: hasResume ? 1 : 0,
                activities: (activitiesRes.data.data || []).reverse(), // Show latest first
            });

            setLeaderboard(leaderboardRes.data.data || []);
        } catch (error) {
            console.error('Failed to load profile statistics:', error);
        } finally {
            clearTimeout(safetyTimeout);
            setLoading(false);
        }
    };

    const handleTabSwitch = async (tab, edit = false) => {
        setActiveTab(tab);
        setEditMode(edit);
        // Refresh all profile API data when switching tabs
        await fetchData();
    };

    const handleSaveProfile = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            const res = await authAPI.updateProfile(formData);
            if (res.data.success) {
                showToast('Profile configured successfully! XP Gained.');
                await refreshUser();
                setEditMode(false);
                setActiveTab('overview');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            showToast('Failed to save profile. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSkill = () => {
        if (!newSkillName.trim()) return;
        if (formData.skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
            showToast('Skill already exists!');
            return;
        }
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, { name: newSkillName.trim(), level: newSkillLevel }]
        }));
        setNewSkillName('');
        setNewSkillLevel(50);
    };

    const handleRemoveSkill = (skillName) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s.name !== skillName)
        }));
    };

    const handleToggleWidget = (widgetKey) => {
        setFormData(prev => ({
            ...prev,
            widgets: {
                ...prev.widgets,
                [widgetKey]: !prev.widgets[widgetKey]
            }
        }));
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    // Theme utility helper
    const getThemeStyles = () => {
        const theme = THEME_COLORS.find(c => c.name === formData.themeColor) || THEME_COLORS[0];
        return theme;
    };

    if (loading || !user) return <Loading fullScreen />;

    const currentTheme = getThemeStyles();
    
    // Level progress calculations
    const userLevel = Number(user?.level) || 1;
    const userXP = Number(user?.xp) || 0;
    const xpNeeded = userLevel * 200;
    const baseXPForCurrentLevel = (userLevel - 1) * 200;
    const xpEarnedInLevel = Math.max(0, userXP - baseXPForCurrentLevel);
    const xpProgressPercent = Math.min(Math.round((xpEarnedInLevel / 200) * 100), 100);

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-dark-50 dark:bg-dark-950/20">
            <div className="max-w-7xl mx-auto">
                {/* Toast Notification */}
                {toast && (
                    <div className="fixed top-24 right-4 z-[9999] px-5 py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow-2xl flex items-center gap-3 animate-fade-in border border-emerald-600/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{toast}</span>
                    </div>
                )}

                {/* Hero Banner Grid */}
                <div className={`relative rounded-3xl overflow-hidden shadow-xl mb-8 border border-dark-200/50 dark:border-dark-800 bg-gradient-to-r ${currentTheme.class.split(' ')[0]} ${currentTheme.class.split(' ')[1]}`}>
                    {/* Abstract patterns overlay */}
                    <div className="absolute inset-0 bg-dark-950/20 backdrop-blur-[1px] pointer-events-none" />
                    <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -left-10 -top-10 w-64 h-64 bg-black/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 z-10 text-white">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar selection display */}
                            <div className="relative group">
                                <img
                                    src={formData.avatar}
                                    alt={user.name}
                                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white/80 bg-dark-900/40 p-1.5 shadow-2xl transition-transform duration-300 hover:scale-105"
                                />
                                <span className="absolute -bottom-1 -right-1 bg-dark-900 border border-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow">
                                    Lvl {user.level}
                                </span>
                            </div>

                            <div className="text-center sm:text-left">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                    <h1 className="text-3xl font-display font-extrabold tracking-tight">{user.name}</h1>
                                    <span className="bg-white/25 backdrop-blur-md text-white border border-white/20 px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase tracking-wider">
                                        {getLevelTitle(user.level)}
                                    </span>
                                </div>
                                <p className="text-white/95 font-medium mt-1 text-base sm:text-lg">{formData.title}</p>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2.5 text-xs text-white/80 font-medium">
                                    {formData.location && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-white/85" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {formData.location}
                                        </span>
                                    )}
                                    {formData.targetRole && (
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 text-white/85" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18a6 6 0 100-12 6 6 0 000 12z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
                                            </svg>
                                            Target: {formData.targetRole}
                                        </span>
                                    )}
                                    <span>Joined: {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Level Widget */}
                        <div className="bg-dark-950/35 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 w-full md:w-80 shadow-inner">
                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-white/90 mb-2 font-mono">
                                <span>Level Progress</span>
                                <span>{user.xp} / {xpNeeded} XP</span>
                            </div>
                            <div className="w-full bg-white/20 h-3.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <div
                                    className="bg-white h-full rounded-full transition-all duration-700 shadow-md"
                                    style={{ width: `${xpProgressPercent}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-white/80 font-medium text-right mt-1.5 font-mono">
                                {xpNeeded - user.xp} XP to Level {user.level + 1}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-dark-200 dark:border-dark-800 pb-px">
                    <button
                        onClick={() => handleTabSwitch('overview', false)}
                        className={`px-5 py-3 font-medium transition-all relative cursor-pointer text-sm ${activeTab === 'overview' && !editMode
                            ? 'text-primary-500 font-bold border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Profile Hub
                        </span>
                    </button>
                    <button
                        onClick={() => handleTabSwitch('overview', true)}
                        className={`px-5 py-3 font-medium transition-all relative cursor-pointer text-sm ${editMode
                            ? 'text-primary-500 font-bold border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Customize Profile
                        </span>
                    </button>
                    <button
                        onClick={() => handleTabSwitch('achievements', false)}
                        className={`px-5 py-3 font-medium transition-all relative cursor-pointer text-sm ${activeTab === 'achievements'
                            ? 'text-primary-500 font-bold border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            Badges & Trophies
                        </span>
                    </button>
                    <button
                        onClick={() => handleTabSwitch('leaderboard', false)}
                        className={`px-5 py-3 font-medium transition-all relative cursor-pointer text-sm ${activeTab === 'leaderboard'
                            ? 'text-primary-500 font-bold border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Leaderboard
                        </span>
                    </button>
                </div>

                {/* MAIN CONTENT PANELS */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT PANEL: Static details & Quick controls */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Interactive Bio Widget */}
                        <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                            <h3 className="font-bold text-dark-900 dark:text-white font-display mb-3">About Me</h3>
                            <p className="text-sm text-dark-600 dark:text-dark-400 leading-relaxed italic">
                                "{formData.bio}"
                            </p>
                            
                            {/* Social Icons Linkouts */}
                            <div className="flex items-center gap-3 mt-6 pt-5 border-t border-dark-100 dark:border-dark-800">
                                {formData.socials.github && (
                                    <a href={formData.socials.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors flex items-center gap-1.5" title="GitHub">
                                        <svg className="w-4 h-4 text-dark-500 fill-current" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                                        </svg>
                                        GitHub
                                    </a>
                                )}
                                {formData.socials.linkedin && (
                                    <a href={formData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors flex items-center gap-1.5" title="LinkedIn">
                                        <svg className="w-4 h-4 text-dark-500 fill-current" viewBox="0 0 24 24">
                                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                        </svg>
                                        LinkedIn
                                    </a>
                                )}
                                {formData.socials.twitter && (
                                    <a href={formData.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors flex items-center gap-1.5" title="Twitter">
                                        <svg className="w-4 h-4 text-dark-500 fill-current" viewBox="0 0 24 24">
                                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                        </svg>
                                        Twitter
                                    </a>
                                )}
                                {formData.socials.website && (
                                    <a href={formData.socials.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors flex items-center gap-1.5" title="Website">
                                        <svg className="w-4 h-4 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                        </svg>
                                        Portfolio
                                    </a>
                                )}
                                {formData.socials.leetcode && (
                                    <a href={`https://leetcode.com/${formData.socials.leetcode}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors flex items-center gap-1.5" title="LeetCode">
                                        <svg className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 24 24">
                                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.77 9.77a1.375 1.375 0 0 0-.025 1.919l8.09 8.09a1.385 1.385 0 0 0 1.96 0l9.76-9.76a1.372 1.372 0 0 0 .008-1.936L14.453.414A1.374 1.374 0 0 0 13.483 0zm.082 2.507 7.79 7.79-8.38 8.38-7.79-7.79 8.38-8.38z"/>
                                        </svg>
                                        LeetCode
                                    </a>
                                )}
                                {!formData.socials.github && !formData.socials.linkedin && !formData.socials.twitter && !formData.socials.website && !formData.socials.leetcode && (
                                    <span className="text-xs text-dark-400 italic">No social links configured yet.</span>
                                )}
                            </div>
                        </Card>

                        {/* Subscription Details Card */}
                        <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 relative overflow-hidden" hover={false}>
                            {/* Graphic background highlights */}
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-500/5 rounded-full blur-xl pointer-events-none" />
                            
                            <h3 className="font-bold text-dark-900 dark:text-white font-display mb-4 flex items-center gap-2 text-sm sm:text-base">
                                <svg className="w-4 h-4 text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                                </svg>
                                Subscription Details
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Tier Info */}
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-dark-400 dark:text-dark-500 block tracking-wider mb-1">Active Plan</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border uppercase tracking-wider ${
                                            user.subscriptionTier === 'lifetime'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                : user.subscriptionTier === 'premium' 
                                                ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                                                : user.subscriptionTier === 'basic'
                                                ? 'bg-primary-500/10 text-primary-400 border-primary-500/20'
                                                : user.subscriptionTier === 'day'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-dark-100 dark:bg-dark-850 text-dark-400 border-dark-200 dark:border-dark-800'
                                        }`}>
                                            {user.subscriptionTier === 'lifetime' && 'Lifetime Pass'}
                                            {user.subscriptionTier === 'premium' && 'Premium Pass'}
                                            {user.subscriptionTier === 'basic' && 'Basic Pass'}
                                            {user.subscriptionTier === 'day' && 'Daily Pass'}
                                            {user.subscriptionTier === 'none' && 'Free Trial'}
                                        </span>
                                    </div>
                                </div>

                                {user.subscriptionTier !== 'none' ? (
                                    <>
                                        {/* Purchase Date */}
                                        {user.subscriptionStartedAt && (
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-dark-400 dark:text-dark-500 block tracking-wider mb-0.5">Purchased On</span>
                                                <span className="text-xs text-dark-700 dark:text-dark-300 font-semibold font-mono">
                                                    {new Date(user.subscriptionStartedAt).toLocaleDateString(undefined, { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}

                                        {/* Expiry Date */}
                                        {user.subscriptionExpiresAt && user.subscriptionTier !== 'lifetime' && (
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-dark-400 dark:text-dark-500 block tracking-wider mb-0.5">Expires On</span>
                                                <span className="text-xs text-dark-700 dark:text-dark-300 font-semibold font-mono">
                                                    {new Date(user.subscriptionExpiresAt).toLocaleDateString(undefined, { 
                                                        year: 'numeric', 
                                                        month: 'long', 
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {user.subscriptionTier === 'lifetime' && (
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-dark-400 dark:text-dark-500 block tracking-wider mb-0.5">Expires On</span>
                                                <span className="text-xs text-amber-500 font-semibold font-mono">
                                                    Never Expires
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="pt-2">
                                        <p className="text-xs text-dark-500 dark:text-dark-400 leading-normal mb-3">
                                            Upgrade to access algorithmic sandboxes, ATS resume checker, LaTeX templates, and mock AI interviews.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('subscription-required', { detail: { requiredTier: 'basic' } }));
                                            }}
                                            className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs tracking-wider transition-all duration-150 cursor-pointer shadow-lg shadow-primary-500/10 text-center"
                                        >
                                            Upgrade Workspace
                                        </button>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Interactive Widget Configuration Panel (Customizable Layout) */}
                        <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                            <h3 className="font-bold text-dark-900 dark:text-white font-display mb-3">Custom Dashboard Widgets</h3>
                            <p className="text-xs text-dark-400 mb-4">Choose which modules are displayed on your profile layout.</p>
                            
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-850 cursor-pointer">
                                    <span className="text-xs font-semibold text-dark-700 dark:text-dark-300 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Statistics Grid
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={formData.widgets.showStats}
                                        onChange={() => handleToggleWidget('showStats')}
                                        className="rounded border-dark-300 dark:border-dark-700 text-primary-500 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-850 cursor-pointer">
                                    <span className="text-xs font-semibold text-dark-700 dark:text-dark-300 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                        </svg>
                                        Badges Shelf
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={formData.widgets.showAchievements}
                                        onChange={() => handleToggleWidget('showAchievements')}
                                        className="rounded border-dark-300 dark:border-dark-700 text-primary-500 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-850 cursor-pointer">
                                    <span className="text-xs font-semibold text-dark-700 dark:text-dark-300 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                        </svg>
                                        Skill Levels
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={formData.widgets.showSkills}
                                        onChange={() => handleToggleWidget('showSkills')}
                                        className="rounded border-dark-300 dark:border-dark-700 text-primary-500 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-850 cursor-pointer">
                                    <span className="text-xs font-semibold text-dark-700 dark:text-dark-300 flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Activity Stream
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={formData.widgets.showActivity}
                                        onChange={() => handleToggleWidget('showActivity')}
                                        className="rounded border-dark-300 dark:border-dark-700 text-primary-500 focus:ring-primary-500"
                                    />
                                </label>
                            </div>

                            {/* Save widgets config fast link */}
                            <button
                                onClick={handleSaveProfile}
                                className="w-full mt-4 py-2 border border-primary-500/20 text-primary-500 dark:text-primary-400 bg-primary-500/5 hover:bg-primary-500/10 rounded-xl text-xs font-bold transition-all"
                            >
                                Apply Widgets Layout
                            </button>
                        </Card>

                        {/* Account Actions */}
                        <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                            <h3 className="font-bold text-dark-900 dark:text-white font-display mb-2">Account Actions</h3>
                            <p className="text-xs text-dark-400 mb-4">Manage your session or sign out of your account on this device.</p>
                            
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log Out of Account
                            </button>
                        </Card>
                    </div>

                    {/* RIGHT PANEL: Dynamic view based on Active Tab */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* TAB 1: PROFILE HUB (OVERVIEW MODE) */}
                        {activeTab === 'overview' && !editMode && (
                            <div className="space-y-6 animate-fade-in">

                                {/* Stats Widget Grid */}
                                {formData.widgets.showStats && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <Card className="p-4 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 flex flex-col justify-between" hover={false}>
                                            <span className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase">DSA Solved</span>
                                            <span className="text-2xl font-black text-dark-900 dark:text-white mt-2 font-display">{stats.dsaSolved}</span>
                                        </Card>
                                        <Card className="p-4 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 flex flex-col justify-between" hover={false}>
                                            <span className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase">Roadmap Nodes</span>
                                            <span className="text-2xl font-black text-dark-900 dark:text-white mt-2 font-display">{stats.topicsCompleted}</span>
                                        </Card>
                                        <Card className="p-4 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 flex flex-col justify-between" hover={false}>
                                            <span className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase">AI Interviews</span>
                                            <span className="text-2xl font-black text-dark-900 dark:text-white mt-2 font-display">{stats.interviewsTaken}</span>
                                        </Card>
                                        <Card className="p-4 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 flex flex-col justify-between" hover={false}>
                                            <span className="text-xs font-semibold text-dark-400 dark:text-dark-500 uppercase">XP Gained</span>
                                            <span className="text-2xl font-black text-primary-500 mt-2 font-display">{user.xp}</span>
                                        </Card>
                                    </div>
                                )}

                                {/* Skills Levels Slider Widget */}
                                {formData.widgets.showSkills && (
                                    <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                                        <h3 className="font-bold text-dark-900 dark:text-white font-display mb-4">Core Skill Levels</h3>
                                        <div className="space-y-4">
                                            {formData.skills.map((skill) => (
                                                <div key={skill.name}>
                                                    <div className="flex justify-between items-center text-xs mb-1.5 font-bold">
                                                        <span className="text-dark-700 dark:text-dark-350">{skill.name}</span>
                                                        <span className="text-primary-500 font-mono">{skill.level}%</span>
                                                    </div>
                                                    <div className="w-full bg-dark-100 dark:bg-dark-800 h-2 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full bg-gradient-to-r ${currentTheme.class.split(' ')[0]} ${currentTheme.class.split(' ')[1]}`}
                                                            style={{ width: `${skill.level}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {formData.skills.length === 0 && (
                                                <p className="text-xs text-dark-400 italic">No skills listed yet. Click "Customize Profile" to add them!</p>
                                            )}
                                        </div>
                                    </Card>
                                )}

                                {/* Achievements Badge Shelf */}
                                {formData.widgets.showAchievements && (
                                    <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                                        <div className="flex justify-between items-center mb-5">
                                            <h3 className="font-bold text-dark-900 dark:text-white font-display">Trophy & Achievements shelf</h3>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-dark-100 dark:bg-dark-850 text-dark-600 dark:text-dark-400">
                                                {user.achievements?.length || 0} / {ACHIEVEMENT_LIST.length} Unlocked
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                            {ACHIEVEMENT_LIST.map((ach) => {
                                                const isUnlocked = user.achievements?.includes(ach.id);
                                                return (
                                                    <div
                                                        key={ach.id}
                                                        className={`p-3 rounded-2xl flex flex-col items-center text-center justify-center border transition-all duration-300 ${
                                                            isUnlocked
                                                                ? 'bg-white dark:bg-dark-850 border-emerald-500/20 shadow-md scale-100'
                                                                : 'bg-dark-100/50 dark:bg-dark-950/20 border-dark-200/40 dark:border-dark-900/50 opacity-40 grayscale scale-95'
                                                        }`}
                                                        title={`${ach.name}: ${ach.desc}`}
                                                    >
                                                        <div className="mb-2">
                                                            {renderAchievementIcon(ach.id)}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-dark-900 dark:text-white leading-tight">{ach.name}</span>
                                                        <span className="text-[8px] text-emerald-500 dark:text-emerald-400 font-extrabold uppercase mt-1">
                                                            {isUnlocked ? 'Unlocked' : 'Locked'}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </Card>
                                )}

                                {/* Interactive Activity Timeline */}
                                {formData.widgets.showActivity && (
                                    <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                                        <h3 className="font-bold text-dark-900 dark:text-white font-display mb-5">Gamified Activity stream</h3>
                                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                                            {stats.activities.map((act, idx) => (
                                                <div key={act._id || idx} className="flex gap-4 items-start text-sm border-l-2 border-dark-200 dark:border-dark-800 pl-4 relative">
                                                    <span className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full ${
                                                        act.activityType === 'TOPIC_COMPLETED' ? 'bg-indigo-500' : 'bg-emerald-500'
                                                    }`} />
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-dark-850 dark:text-dark-300">{act.detail}</p>
                                                        <span className="text-[10px] text-dark-400">{new Date(act.date).toLocaleString()}</span>
                                                    </div>
                                                    <span className="text-xs font-mono font-extrabold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                        +{act.activityType === 'TOPIC_COMPLETED' ? 50 : 20} XP
                                                    </span>
                                                </div>
                                            ))}
                                            {stats.activities.length === 0 && (
                                                <p className="text-xs text-dark-400 italic">No logged activity yet. Keep completing roadmaps and problems!</p>
                                            )}
                                        </div>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* TAB 2: PROFILE CUSTOMIZATION MODE */}
                        {editMode && (
                            <form onSubmit={handleSaveProfile} className="space-y-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 p-6 md:p-8 rounded-3xl animate-fade-in">
                                <div className="flex justify-between items-center border-b border-dark-100 dark:border-dark-800 pb-4 mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-dark-900 dark:text-white font-display">Configure Identity</h3>
                                        <p className="text-xs text-dark-400 mt-1">Design your profile layout, details, theme, and badges</p>
                                    </div>
                                    <Button type="submit" disabled={saving} className="text-xs font-bold py-2 px-4">
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="Designation / Professional Title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. MERN Stack Engineer | LeetCode Hacker"
                                        required
                                    />
                                    <Input
                                        label="Location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. Seattle, WA or Remote"
                                    />
                                    <Input
                                        label="Target Role"
                                        value={formData.targetRole}
                                        onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                                        placeholder="e.g. Senior Backend Dev or SDE 1"
                                    />
                                    <div>
                                        <label className="label">Dynamic Theme Accent Color</label>
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                            {THEME_COLORS.map((color) => (
                                                <button
                                                    key={color.name}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, themeColor: color.name })}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                                        formData.themeColor === color.name
                                                            ? 'border-primary-500 bg-primary-500/10 text-primary-500 font-bold scale-105 shadow-sm'
                                                            : 'border-dark-200 dark:border-dark-800 text-dark-500 hover:bg-dark-50 dark:hover:bg-dark-850'
                                                    }`}
                                                >
                                                    {color.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Input
                                    label="Custom Short Bio"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    textarea
                                    rows={3}
                                    placeholder="Write a tiny pitch about your interests..."
                                    required
                                />

                                {/* Interactive Avatar Picker */}
                                <div>
                                    <label className="label">Choose Tech Avatar</label>
                                    <div className="flex flex-wrap gap-4 mt-2">
                                        {PRESET_AVATARS.map((av) => (
                                            <button
                                                key={av.name}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, avatar: av.url })}
                                                className={`p-1.5 rounded-2xl border-2 transition-all cursor-pointer bg-dark-100 dark:bg-dark-850 ${
                                                    formData.avatar === av.url
                                                        ? 'border-primary-500 scale-110 shadow-lg'
                                                        : 'border-transparent opacity-70 hover:opacity-100'
                                                }`}
                                            >
                                                <img src={av.url} alt={av.name} className="w-14 h-14" />
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-4 p-4 border border-dashed border-dark-300 dark:border-dark-700 rounded-2xl bg-dark-50/50 dark:bg-dark-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <h5 className="text-sm font-semibold text-dark-900 dark:text-white">Upload Custom Profile Picture</h5>
                                            <p className="text-xs text-dark-400">Supports JPG, PNG, GIF up to 5MB</p>
                                        </div>
                                        <label className="relative cursor-pointer bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-md flex items-center gap-2">
                                            {uploadingImage ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                    <span>Choose Image File</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-4">
                                        <Input
                                            label="Or enter custom Image URL"
                                            value={formData.avatar}
                                            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>
                                </div>

                                {/* Skills custom config */}
                                <div className="border-t border-dark-150 dark:border-dark-800 pt-6">
                                    <h4 className="font-bold text-sm text-dark-900 dark:text-white mb-3">Add Core Skills</h4>
                                    
                                    {/* Skill add controls */}
                                    <div className="flex flex-wrap gap-4 items-end mb-4 bg-dark-50 dark:bg-dark-950/40 p-4 rounded-2xl border border-dark-200/40 dark:border-dark-800/60">
                                        <div className="flex-1 min-w-[200px]">
                                            <label className="label text-[10px] uppercase font-bold">Skill Name</label>
                                            <input
                                                type="text"
                                                value={newSkillName}
                                                onChange={(e) => setNewSkillName(e.target.value)}
                                                className="input text-xs h-9"
                                                placeholder="e.g. React, Docker, System Design"
                                            />
                                        </div>
                                        <div className="w-48">
                                            <div className="flex justify-between items-center text-[10px] uppercase font-bold mb-1">
                                                <span>Expertise</span>
                                                <span className="text-primary-500">{newSkillLevel}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                value={newSkillLevel}
                                                onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                                                className="w-full accent-primary-500 h-1.5 cursor-pointer bg-dark-200 dark:bg-dark-855 rounded-lg appearance-none"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddSkill}
                                            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all h-9 cursor-pointer"
                                        >
                                            Add Skill
                                        </button>
                                    </div>

                                    {/* Render added skills */}
                                    <div className="flex flex-wrap gap-2">
                                        {formData.skills.map((skill) => (
                                            <span
                                                key={skill.name}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-100 dark:bg-dark-850 hover:bg-red-500/10 hover:text-red-500 border border-dark-200 dark:border-dark-850 rounded-xl text-xs font-semibold text-dark-700 dark:text-dark-300 transition-all cursor-pointer group"
                                                onClick={() => handleRemoveSkill(skill.name)}
                                                title="Click to remove skill"
                                            >
                                                {skill.name} ({skill.level}%)
                                                <span className="text-dark-400 group-hover:text-red-500 text-[10px]">✕</span>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Social Links config */}
                                <div className="border-t border-dark-150 dark:border-dark-800 pt-6 space-y-4">
                                    <h4 className="font-bold text-sm text-dark-900 dark:text-white mb-2">Connect details</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Input
                                            label="GitHub Profile URL"
                                            value={formData.socials.github}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socials: { ...formData.socials, github: e.target.value }
                                            })}
                                            placeholder="https://github.com/username"
                                        />
                                        <Input
                                            label="LinkedIn Profile URL"
                                            value={formData.socials.linkedin}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socials: { ...formData.socials, linkedin: e.target.value }
                                            })}
                                            placeholder="https://linkedin.com/in/username"
                                        />
                                        <Input
                                            label="Twitter URL"
                                            value={formData.socials.twitter}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socials: { ...formData.socials, twitter: e.target.value }
                                            })}
                                            placeholder="https://twitter.com/username"
                                        />
                                        <Input
                                            label="Personal Website"
                                            value={formData.socials.website}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socials: { ...formData.socials, website: e.target.value }
                                            })}
                                            placeholder="https://mywebsite.dev"
                                        />
                                        <Input
                                            label="LeetCode Username"
                                            value={formData.socials.leetcode}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                socials: { ...formData.socials, leetcode: e.target.value }
                                            })}
                                            placeholder="LeetCode username (e.g. Tushar_Seth)"
                                        />
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* TAB 3: DYNAMIC TROPHIES shelf */}
                        {activeTab === 'achievements' && (
                            <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 animate-fade-in" hover={false}>
                                <div className="mb-6">
                                    <h3 className="font-bold text-xl text-dark-900 dark:text-white font-display">Trophies & Badges Cabinet</h3>
                                    <p className="text-xs text-dark-400 mt-1">Unlock badges by interacting with ATS resume reviewer, mock AI interviews, and DSA progress trackers.</p>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    {ACHIEVEMENT_LIST.map((ach) => {
                                        const isUnlocked = user.achievements?.includes(ach.id);
                                        return (
                                            <div
                                                key={ach.id}
                                                className={`p-4 rounded-2xl border flex gap-4 items-center transition-all ${
                                                    isUnlocked
                                                        ? 'bg-white dark:bg-dark-850 border-emerald-500/20 shadow-md'
                                                        : 'bg-dark-100/50 dark:bg-dark-950/20 border-dark-200/40 dark:border-dark-900/50 opacity-45 grayscale'
                                                }`}
                                            >
                                                <div className="w-12 h-12 bg-dark-50 dark:bg-dark-900 rounded-full flex items-center justify-center shadow-sm">
                                                    {renderAchievementIcon(ach.id, "w-6 h-6")}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-bold text-sm text-dark-900 dark:text-white leading-tight">{ach.name}</h4>
                                                        <span className="text-[9px] font-bold tracking-wider uppercase text-dark-400 dark:text-dark-500 bg-dark-100 dark:bg-dark-900 px-1.5 py-0.5 rounded">
                                                            {ach.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-dark-500 dark:text-dark-400 mt-1 leading-snug">{ach.desc}</p>
                                                    <span className={`text-[9px] font-extrabold uppercase mt-2.5 block ${
                                                        isUnlocked ? 'text-emerald-500 dark:text-emerald-400' : 'text-dark-400'
                                                    }`}>
                                                        {isUnlocked ? '✓ Unlocked' : '🔒 Locked'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        )}

                        {/* TAB 4: INTERACTIVE GLOBAL LEADERBOARD */}
                        {activeTab === 'leaderboard' && (
                            <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 animate-fade-in" hover={false}>
                                <div className="mb-6">
                                    <h3 className="font-bold text-xl text-dark-900 dark:text-white font-display">Global Arena Leaderboard</h3>
                                    <p className="text-xs text-dark-400 mt-1">See how you rank globally against other developers practicing in CodeForge workstation.</p>
                                </div>

                                <div className="space-y-3">
                                    {leaderboard.map((leader, index) => {
                                        const isCurrentUser = leader._id === user.id;
                                        return (
                                            <div
                                                key={leader._id}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                                                    isCurrentUser
                                                        ? `border-primary-500 bg-primary-500/5 shadow-md`
                                                        : 'border-dark-200/40 dark:border-dark-800 bg-white dark:bg-dark-850'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {/* Rank Indicator */}
                                                    {renderRankBadge(index)}

                                                    {/* Avatar */}
                                                    <img
                                                        src={leader.avatar || PRESET_AVATARS[0].url}
                                                        alt={leader.name}
                                                        className="w-10 h-10 rounded-full bg-dark-900/10 p-0.5"
                                                    />

                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-sm text-dark-900 dark:text-white leading-tight">
                                                                {leader.name}
                                                            </h4>
                                                            {isCurrentUser && (
                                                                <span className="text-[8px] bg-primary-500 text-white font-bold px-1 py-0.5 rounded uppercase tracking-wider">You</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-dark-450 mt-0.5">{leader.title || 'Software Explorer'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-dark-100 dark:bg-dark-900 text-dark-500 dark:text-dark-400 font-mono">
                                                        Lvl {leader.level || 1}
                                                    </span>
                                                    <span className="text-sm font-black text-dark-900 dark:text-white font-mono">
                                                        {leader.xp || 0} XP
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {leaderboard.length === 0 && (
                                        <p className="text-xs text-dark-450 italic text-center py-6">Loading leaderboard standings...</p>
                                    )}
                                </div>
                            </Card>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
