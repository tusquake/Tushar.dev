import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI, learningAPI, dsaProgressAPI, interviewAPI, resumeAPI } from '../services/api';
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

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, edit, leaderboard, achievements
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [toast, setToast] = useState('');
    
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
        socials: { github: '', linkedin: '', twitter: '', website: '' },
        themeColor: 'purple',
        avatar: '',
        widgets: { showStats: true, showAchievements: true, showActivity: true, showSkills: true }
    });

    // Skill inputs
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState(50);

    useEffect(() => {
        if (user) {
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
                },
                themeColor: user.themeColor || 'purple',
                avatar: user.avatar || PRESET_AVATARS[0].url,
                widgets: user.widgets || { showStats: true, showAchievements: true, showActivity: true, showSkills: true }
            });
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch stats from various endpoints
            const [topicsRes, dsaRes, activitiesRes, interviewRes, resumeRes, leaderboardRes] = await Promise.all([
                learningAPI.getAll(),
                dsaProgressAPI.getProgress(),
                learningAPI.getActivityHistory(),
                interviewAPI.getAll(),
                resumeAPI.get(),
                authAPI.getLeaderboard(),
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
            setLoading(false);
        }
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
    const xpNeeded = user.level * 200;
    const baseXPForCurrentLevel = (user.level - 1) * 200;
    const xpEarnedInLevel = user.xp - baseXPForCurrentLevel;
    const xpProgressPercent = Math.min(Math.round((xpEarnedInLevel / 200) * 100), 100);

    return (
        <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-dark-50 dark:bg-dark-950/20">
            <div className="max-w-7xl mx-auto">
                {/* Toast Notification */}
                {toast && (
                    <div className="fixed top-24 right-4 z-[9999] px-5 py-3 rounded-xl bg-emerald-500 text-white font-semibold shadow-2xl flex items-center gap-3 animate-fade-in border border-emerald-600/20">
                        <span>✨</span>
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
                                            📍 {formData.location}
                                        </span>
                                    )}
                                    {formData.targetRole && (
                                        <span className="flex items-center gap-1">
                                            🎯 Target: {formData.targetRole}
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
                        onClick={() => { setActiveTab('overview'); setEditMode(false); }}
                        className={`px-5 py-3 font-medium transition-all relative cursor-pointer text-sm ${activeTab === 'overview' && !editMode
                            ? 'text-primary-500 font-bold border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'
                            }`}
                    >
                        👤 Profile Hub
                    </button>
                    <button
                        onClick={() => { setActiveTab('overview'); setEditMode(true); }}
                        className={`px-5 py-3 font-medium transition-all relative cursor-pointer text-sm ${editMode
                            ? 'text-primary-500 font-bold border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'
                            }`}
                    >
                        ⚙️ Customize Profile
                    </button>
                    <button
                        onClick={() => { setActiveTab('achievements'); setEditMode(false); }}
                        className={`px-5 py-3 font-medium transition-all relative cursor-pointer text-sm ${activeTab === 'achievements'
                            ? 'text-primary-500 font-bold border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'
                            }`}
                    >
                        🏆 Badges & Trophies
                    </button>
                    <button
                        onClick={() => { setActiveTab('leaderboard'); setEditMode(false); }}
                        className={`px-5 py-3 font-medium transition-all relative cursor-pointer text-sm ${activeTab === 'leaderboard'
                            ? 'text-primary-500 font-bold border-b-2 border-primary-500'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'
                            }`}
                    >
                        🔥 Leaderboard
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
                                    <a href={formData.socials.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors" title="GitHub">
                                        📁 GitHub
                                    </a>
                                )}
                                {formData.socials.linkedin && (
                                    <a href={formData.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors" title="LinkedIn">
                                        🔗 LinkedIn
                                    </a>
                                )}
                                {formData.socials.twitter && (
                                    <a href={formData.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors" title="Twitter">
                                        🐦 Twitter
                                    </a>
                                )}
                                {formData.socials.website && (
                                    <a href={formData.socials.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-dark-100 dark:bg-dark-850 hover:bg-dark-200 dark:hover:bg-dark-800 border border-dark-200/60 dark:border-dark-800 rounded-lg text-dark-600 dark:text-dark-300 transition-colors" title="Website">
                                        🌐 Portfolio
                                    </a>
                                )}
                                {!formData.socials.github && !formData.socials.linkedin && !formData.socials.twitter && !formData.socials.website && (
                                    <span className="text-xs text-dark-400 italic">No social links configured yet.</span>
                                )}
                            </div>
                        </Card>

                        {/* Interactive Widget Configuration Panel (Customizable Layout) */}
                        <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                            <h3 className="font-bold text-dark-900 dark:text-white font-display mb-3">Custom Dashboard Widgets</h3>
                            <p className="text-xs text-dark-400 mb-4">Choose which modules are displayed on your profile layout.</p>
                            
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-850 cursor-pointer">
                                    <span className="text-xs font-semibold text-dark-700 dark:text-dark-300">📈 Statistics Grid</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.widgets.showStats}
                                        onChange={() => handleToggleWidget('showStats')}
                                        className="rounded border-dark-300 dark:border-dark-700 text-primary-500 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-850 cursor-pointer">
                                    <span className="text-xs font-semibold text-dark-700 dark:text-dark-300">🏅 Badges Shelf</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.widgets.showAchievements}
                                        onChange={() => handleToggleWidget('showAchievements')}
                                        className="rounded border-dark-300 dark:border-dark-700 text-primary-500 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-850 cursor-pointer">
                                    <span className="text-xs font-semibold text-dark-700 dark:text-dark-300">📊 Skill Levels</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.widgets.showSkills}
                                        onChange={() => handleToggleWidget('showSkills')}
                                        className="rounded border-dark-300 dark:border-dark-700 text-primary-500 focus:ring-primary-500"
                                    />
                                </label>

                                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-850 cursor-pointer">
                                    <span className="text-xs font-semibold text-dark-700 dark:text-dark-300">⏳ Activity Stream</span>
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
                                                        <span className="text-2xl sm:text-3xl mb-1.5">{ach.icon}</span>
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
                                                <div className="w-12 h-12 bg-dark-50 dark:bg-dark-900 rounded-full flex items-center justify-center text-3xl shadow-sm">
                                                    {ach.icon}
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
                                                    <span className={`w-8 text-center font-display font-extrabold text-lg ${
                                                        index === 0 ? 'text-amber-500' : index === 1 ? 'text-dark-400' : index === 2 ? 'text-amber-600' : 'text-dark-500'
                                                    }`}>
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                                    </span>

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
