import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, certificatesAPI, contactAPI, uploadAPI, learningAPI, dsaProgressAPI, tasksAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { ALL_QUESTIONS } from '../data/dsaQuestions';
import Heatmap from '../components/common/Heatmap';

const Dashboard = () => {
    const { user, isAdmin, loading: authLoading, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState(isAdmin ? 'projects' : 'roadmap');
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    
    // Helper to get local date string YYYY-MM-DD
    const getLocalDateString = (dateObj = new Date()) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getLocalDateString());

    const [data, setData] = useState({
        projects: [],
        certificates: [],
        contacts: [],
        learningTopics: [],
        dsaProgress: [],
        activities: [],
        tasks: [],
    });

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3500);
    };

    // Helper to get local date range of the current week based on selectedDateStr
    const getWeekDays = (selectedDateStr) => {
        const [year, month, day] = selectedDateStr.split('-').map(Number);
        const selectedDateObj = new Date(year, month - 1, day);
        
        const dayOfWeek = selectedDateObj.getDay(); // 0 is Sunday
        const startOfWeek = new Date(selectedDateObj);
        startOfWeek.setDate(selectedDateObj.getDate() - dayOfWeek);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const handlePrevWeek = () => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const current = new Date(year, month - 1, day);
        current.setDate(current.getDate() - 7);
        setSelectedDate(getLocalDateString(current));
    };

    const handleNextWeek = () => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const current = new Date(year, month - 1, day);
        current.setDate(current.getDate() + 7);
        setSelectedDate(getLocalDateString(current));
    };

    const handleGoToToday = () => {
        setSelectedDate(getLocalDateString(new Date()));
    };

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'project', 'certificate', 'learningTopic', 'task'
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            // Set initial active tab based on role
            setActiveTab(isAdmin ? 'projects' : 'roadmap');
            fetchAllData();
        }
    }, [authLoading, isAdmin]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            if (isAdmin) {
                const [projectsRes, certificatesRes, contactsRes] = await Promise.all([
                    projectsAPI.getAll(),
                    certificatesAPI.getAll(),
                    contactAPI.getAll(),
                ]);

                setData({
                    projects: projectsRes.data.data || [],
                    certificates: certificatesRes.data.data || [],
                    contacts: contactsRes.data.data || [],
                    learningTopics: [],
                    dsaProgress: [],
                    activities: [],
                    tasks: [],
                });
            } else {
                const [topicsRes, dsaRes, activitiesRes, tasksRes] = await Promise.all([
                    learningAPI.getAll(),
                    dsaProgressAPI.getProgress(),
                    learningAPI.getActivityHistory(),
                    tasksAPI.getAll(),
                ]);

                setData({
                    projects: [],
                    certificates: [],
                    contacts: [],
                    learningTopics: topicsRes.data.data || [],
                    dsaProgress: dsaRes.data.completedQuestions || [],
                    activities: activitiesRes.data.data || [],
                    tasks: tasksRes.data.data || [],
                });
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = (type) => {
        setModalType(type);
        setEditItem(null);
        setFormData(getEmptyForm(type));
        setImagePreview(null);
        setShowModal(true);
    };

    const openEditModal = (type, item) => {
        setModalType(type);
        setEditItem(item);
        setFormData(item);
        setImagePreview(item.image ? `http://localhost:5000${item.image}` : null);
        setShowModal(true);
    };

    const getEmptyForm = (type) => {
        switch (type) {
            case 'project':
                return { title: '', description: '', techStack: '', githubLink: '', liveDemo: '', image: '', featured: false };
            case 'certificate':
                return { name: '', issuer: '', issueDate: '', credentialUrl: '', image: '' };
            case 'learningTopic':
                return { title: '', category: 'Other', description: '', status: 'not-started', priority: 3, notes: '' };
            case 'task':
                return { title: '', description: '', date: selectedDate, category: 'Other', priority: 2, completed: false };
            default:
                return {};
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = { ...formData };

            // Convert techStack string to array for projects
            if (modalType === 'project' && typeof payload.techStack === 'string') {
                payload.techStack = payload.techStack.split(',').map(s => s.trim()).filter(Boolean);
            }

            if (editItem) {
                if (modalType === 'project') {
                    await projectsAPI.update(editItem._id, payload);
                } else if (modalType === 'certificate') {
                    await certificatesAPI.update(editItem._id, payload);
                } else if (modalType === 'learningTopic') {
                    await learningAPI.update(editItem._id, payload);
                } else if (modalType === 'task') {
                    await tasksAPI.update(editItem._id, payload);
                }
            } else {
                if (modalType === 'project') {
                    await projectsAPI.create(payload);
                } else if (modalType === 'certificate') {
                    await certificatesAPI.create(payload);
                } else if (modalType === 'learningTopic') {
                    await learningAPI.create(payload);
                } else if (modalType === 'task') {
                    await tasksAPI.create(payload);
                }
            }

            fetchAllData();
            setShowModal(false);
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (type, id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            if (type === 'project') {
                await projectsAPI.delete(id);
            } else if (type === 'certificate') {
                await certificatesAPI.delete(id);
            } else if (type === 'contact') {
                await contactAPI.delete(id);
            } else if (type === 'learningTopic') {
                await learningAPI.delete(id);
            } else if (type === 'task') {
                await tasksAPI.delete(id);
            }
            fetchAllData();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await learningAPI.updateStatus(id, newStatus);
            // Instant local state update for snappy feel
            setData(prev => ({
                ...prev,
                learningTopics: prev.learningTopics.map(topic => 
                    topic._id === id ? { ...topic, status: newStatus } : topic
                )
            }));
            // Fetch fresh activity log to update the heatmap in real time
            const activityRes = await learningAPI.getActivityHistory();
            setData(prev => ({
                ...prev,
                activities: activityRes.data.data || []
            }));
        } catch (error) {
            console.error('Failed to update status:', error);
            fetchAllData(); // rollback to DB state if failed
        }
    };

    const handleToggleTask = async (task) => {
        try {
            // Snappy local state update
            const updatedCompleted = !task.completed;
            setData(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t._id === task._id ? { ...t, completed: updatedCompleted } : t)
            }));

            const res = await tasksAPI.update(task._id, { completed: updatedCompleted });
            
            if (updatedCompleted && res.data?.xpResult?.success) {
                showToast(`🎉 Task completed! +${res.data.xpResult.xpAdded} XP gained.`);
                refreshUser();
            }

            // Fetch fresh activity log to update the heatmap in real time
            const activityRes = await learningAPI.getActivityHistory();
            setData(prev => ({
                ...prev,
                activities: activityRes.data.data || []
            }));
        } catch (error) {
            console.error('Failed to toggle task:', error);
            fetchAllData(); // rollback
        }
    };

    // Admin Dashboard Tabs
    const adminTabs = [
        { id: 'projects', label: 'Projects', count: data.projects.length },
        { id: 'certificates', label: 'Certificates', count: data.certificates.length },
        { id: 'contacts', label: 'Messages', count: data.contacts.length },
    ];

    // Calculate today's incomplete tasks count
    const todayStr = getLocalDateString(new Date());
    const todayTasks = data.tasks.filter(t => {
        const tDateStr = getLocalDateString(new Date(t.date));
        return tDateStr === todayStr;
    });
    const todayIncompleteCount = todayTasks.filter(t => !t.completed).length;

    // User Dashboard Tabs
    const userTabs = [
        { id: 'roadmap', label: 'My Roadmap', count: data.learningTopics.length },
        { id: 'tasks', label: 'Daily Planner', count: todayIncompleteCount },
        { id: 'dsaStats', label: 'DSA Progress Stats', count: data.dsaProgress.length },
    ];

    const getTaskPriorityBadge = (priority) => {
        switch (priority) {
            case 3: return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-250/20';
            case 2: return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border border-amber-250/20';
            case 1: 
            default:
                return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-250/20';
        }
    };

    const getTaskPriorityLabel = (priority) => {
        switch (priority) {
            case 3: return 'High';
            case 2: return 'Medium';
            case 1: return 'Low';
            default: return 'Medium';
        }
    };

    const currentTabs = isAdmin ? adminTabs : userTabs;

    // DSA Progress Calculations
    const totalDsa = ALL_QUESTIONS.length;
    const completedDsa = data.dsaProgress.length;
    const dsaPercent = totalDsa ? Math.round((completedDsa / totalDsa) * 100) : 0;

    const easyQs = ALL_QUESTIONS.filter(q => q.d === 'Easy');
    const easyCompleted = easyQs.filter(q => data.dsaProgress.includes(q.gid)).length;
    const easyPercent = easyQs.length ? Math.round((easyCompleted / easyQs.length) * 100) : 0;

    const mediumQs = ALL_QUESTIONS.filter(q => q.d === 'Medium');
    const mediumCompleted = mediumQs.filter(q => data.dsaProgress.includes(q.gid)).length;
    const mediumPercent = mediumQs.length ? Math.round((mediumCompleted / mediumQs.length) * 100) : 0;

    const hardQs = ALL_QUESTIONS.filter(q => q.d === 'Hard');
    const hardCompleted = hardQs.filter(q => data.dsaProgress.includes(q.gid)).length;
    const hardPercent = hardQs.length ? Math.round((hardCompleted / hardQs.length) * 100) : 0;

    const getCategoryBadgeColor = (cat) => {
        switch (cat) {
            case 'Frontend': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Backend': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'DSA': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'System Design': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'DevOps': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-dark-800 dark:text-dark-350';
        }
    };

    const getPriorityBadgeColor = (priority) => {
        if (priority >= 4) return 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 border border-rose-250/20';
        if (priority === 3) return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-450 border border-amber-250/20';
        return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border border-emerald-250/20';
    };

    if (authLoading || loading) return <Loading fullScreen />;

    return (
        <div className="min-h-screen py-12 px-4 bg-dark-50 dark:bg-dark-950/20">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="section-title text-left">Dashboard</h1>
                        <p className="mt-2 text-dark-500 dark:text-dark-400">
                            Welcome back, <span className="font-semibold text-primary-500">{user?.name}</span>! {isAdmin ? 'Manage portfolio content and view messages here.' : 'Track your roadmaps and prep statistics.'}
                        </p>
                    </div>
                    {!isAdmin && (
                        <Link to="/learning" className="btn-primary self-start md:self-auto flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Go to Learning Portal
                        </Link>
                    )}
                </div>

                {/* Heatmap for standard users */}
                {!isAdmin && (
                    <Heatmap activities={data.activities} />
                )}

                {/* Role-Based Navigation Tabs */}
                <div className="flex gap-2 mb-6 border-b border-dark-200 dark:border-dark-800">
                    {currentTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-medium transition-all relative cursor-pointer ${activeTab === tab.id
                                ? 'text-primary-600 dark:text-primary-400 font-bold'
                                : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                                }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400">
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                            )}
                        </button>
                    ))}
                </div>

                {/* ======================================================== */}
                {/* ADMIN TABS                                               */}
                {/* ======================================================== */}
                {isAdmin && activeTab === 'projects' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => openAddModal('project')}>
                                <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Project
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.projects.map((project) => (
                                <Card key={project._id} className="p-5 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2.5">
                                                <h3 className="font-bold text-lg text-dark-900 dark:text-white">{project.title}</h3>
                                                {project.featured && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wide rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                        </svg>
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1 max-w-3xl">{project.description}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {project.techStack?.map((tech) => (
                                                    <span key={tech} className="badge badge-primary text-[11px] font-medium">{tech}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal('project', project)}
                                                className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg cursor-pointer transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete('project', project._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {data.projects.length === 0 && (
                                <div className="text-center py-16 text-dark-500 bg-white/40 dark:bg-dark-900/40 rounded-2xl border border-dark-200/50 dark:border-dark-800">
                                    No projects yet. Add your first project!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isAdmin && activeTab === 'certificates' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => openAddModal('certificate')}>
                                <svg className="w-5 h-5 mr-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Certificate
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.certificates.map((cert) => (
                                <Card key={cert._id} className="p-5 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-dark-900 dark:text-white">{cert.name}</h3>
                                            <p className="text-sm font-semibold text-primary-500 mt-0.5">{cert.issuer}</p>
                                            <p className="text-xs text-dark-405 mt-1">
                                                Issued: {new Date(cert.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal('certificate', cert)}
                                                className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg cursor-pointer transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete('certificate', cert._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {data.certificates.length === 0 && (
                                <div className="text-center py-16 text-dark-500 bg-white/40 dark:bg-dark-900/40 rounded-2xl border border-dark-200/50 dark:border-dark-800">
                                    No certificates yet. Add your first certificate!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {isAdmin && activeTab === 'contacts' && (
                    <div className="space-y-4 animate-fade-in">
                        {data.contacts.map((contact) => (
                            <Card key={contact._id} className="p-5 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800" hover={false}>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-dark-900 dark:text-white text-base">{contact.name}</h3>
                                            {!contact.read && (
                                                <span className="px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">New</span>
                                            )}
                                        </div>
                                        <a href={`mailto:${contact.email}`} className="text-sm text-primary-500 hover:underline mt-0.5 block">{contact.email}</a>
                                        {contact.subject && (
                                            <p className="text-sm font-semibold text-dark-700 dark:text-dark-300 mt-2">
                                                Subject: {contact.subject}
                                            </p>
                                        )}
                                        <div className="text-sm text-dark-550 dark:text-dark-400 mt-2 p-3 bg-dark-50 dark:bg-dark-950/45 rounded-xl border border-dark-200/40 dark:border-dark-800/60 leading-relaxed whitespace-pre-line">
                                            {contact.message}
                                        </div>
                                        <p className="text-[10px] text-dark-400 mt-3 flex items-center gap-1">
                                            <svg className="w-3 h-3 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {new Date(contact.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete('contact', contact._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-colors"
                                        title="Delete Message"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </Card>
                        ))}
                        {data.contacts.length === 0 && (
                            <div className="text-center py-16 text-dark-500 bg-white/40 dark:bg-dark-900/40 rounded-2xl border border-dark-200/50 dark:border-dark-800">
                                No contact messages yet.
                            </div>
                        )}
                    </div>
                )}


                {/* ======================================================== */}
                {/* STANDARD USER TABS                                       */}
                {/* ======================================================== */}
                {!isAdmin && activeTab === 'roadmap' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-dark-900 dark:text-white font-display">Personal Roadmap Topics</h2>
                                <p className="text-sm text-dark-400">Add custom modules, concepts, or stacks you are targeting to learn.</p>
                            </div>
                            <Button onClick={() => openAddModal('learningTopic')} className="flex items-center gap-2">
                                <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Study Topic
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.learningTopics.map((topic) => (
                                <Card key={topic._id} className="p-5 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 flex flex-col justify-between" hover={false}>
                                    <div>
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${getCategoryBadgeColor(topic.category)}`}>
                                                {topic.category}
                                            </span>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${getPriorityBadgeColor(topic.priority)}`}>
                                                P{topic.priority} Priority
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-dark-900 dark:text-white leading-snug">{topic.title}</h3>
                                        {topic.description && (
                                            <p className="text-sm text-dark-500 dark:text-dark-400 mt-2 line-clamp-3 leading-relaxed">
                                                {topic.description}
                                            </p>
                                        )}
                                        {topic.notes && (
                                            <div className="mt-4 p-3 bg-dark-50 dark:bg-dark-950/40 border border-dark-200/40 dark:border-dark-800/40 rounded-xl">
                                                <span className="text-[10px] font-bold uppercase text-dark-450 tracking-wider block mb-1">Notes:</span>
                                                <p className="text-xs text-dark-600 dark:text-dark-450 whitespace-pre-line line-clamp-4">{topic.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-dark-100 dark:border-dark-800 flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-dark-450 block mb-1">Status</label>
                                            <select
                                                value={topic.status}
                                                onChange={(e) => handleUpdateStatus(topic._id, e.target.value)}
                                                className="w-full text-xs font-semibold py-1.5 px-2 bg-dark-100 dark:bg-dark-850 border border-dark-200 dark:border-dark-800 rounded-lg text-dark-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                                            >
                                                <option value="not-started">Not Started</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        <div className="flex gap-1.5 self-end">
                                            <button
                                                onClick={() => openEditModal('learningTopic', topic)}
                                                className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/25 rounded-lg cursor-pointer transition-colors"
                                                title="Edit topic"
                                            >
                                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete('learningTopic', topic._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/25 rounded-lg cursor-pointer transition-colors"
                                                title="Delete topic"
                                            >
                                                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                            {data.learningTopics.length === 0 && (
                                <div className="col-span-full text-center py-16 text-dark-500 bg-white/40 dark:bg-dark-900/40 rounded-2xl border border-dark-200/50 dark:border-dark-800">
                                    <svg className="w-12 h-12 text-dark-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <h3 className="font-bold text-dark-700 dark:text-dark-300">Your roadmap is empty</h3>
                                    <p className="text-sm text-dark-400 max-w-sm mx-auto mt-1">Create topic nodes for items like "Spring Boot Security", "Docker Basics" or "System Design Basics" to start tracking.</p>
                                    <Button onClick={() => openAddModal('learningTopic')} className="mt-4 text-xs font-semibold py-2">
                                        Add First Topic
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!isAdmin && activeTab === 'tasks' && (() => {
                    const filteredTasks = data.tasks.filter(t => {
                        const tDateStr = getLocalDateString(new Date(t.date));
                        return tDateStr === selectedDate;
                    });
                    const dayTotal = filteredTasks.length;
                    const dayCompleted = filteredTasks.filter(t => t.completed).length;
                    const dayPercent = dayTotal ? Math.round((dayCompleted / dayTotal) * 100) : 0;

                    return (
                        <div className="animate-fade-in space-y-6">
                            {/* Calendar Header with Navigation */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-dark-900 p-5 rounded-2xl border border-dark-200/50 dark:border-dark-800">
                                <div>
                                    <h2 className="text-xl font-bold text-dark-900 dark:text-white font-display flex items-center gap-2">
                                        <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Daily Planner
                                    </h2>
                                    <p className="text-xs text-dark-400 mt-1">Schedule daily tasks, finish them, and gain XP rewards.</p>
                                </div>
                                
                                {/* Controls */}
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={handlePrevWeek}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 border border-dark-200 dark:border-dark-800 rounded-xl cursor-pointer text-dark-600 dark:text-dark-400 transition-colors"
                                        title="Previous Week"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    
                                    <span className="font-bold text-sm text-dark-800 dark:text-dark-200 min-w-[120px] text-center font-display">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </span>

                                    <button 
                                        onClick={handleNextWeek}
                                        className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 border border-dark-200 dark:border-dark-800 rounded-xl cursor-pointer text-dark-600 dark:text-dark-400 transition-colors"
                                        title="Next Week"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>

                                    <button
                                        onClick={handleGoToToday}
                                        className="px-3 py-1.5 text-xs font-bold bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl border border-primary-200/30 hover:bg-primary-100/50 transition-colors cursor-pointer"
                                    >
                                        Today
                                    </button>

                                    {/* Date Picker Input Wrapper */}
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={selectedDate}
                                            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                        <button
                                            type="button"
                                            className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 border border-dark-200 dark:border-dark-800 rounded-xl text-dark-600 dark:text-dark-400 transition-colors pointer-events-none"
                                        >
                                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Weekly Calendar Strip */}
                            <div className="grid grid-cols-7 gap-2 bg-white dark:bg-dark-900 p-4 rounded-2xl border border-dark-200/50 dark:border-dark-800">
                                {getWeekDays(selectedDate).map((day, idx) => {
                                    const dateStr = getLocalDateString(day);
                                    const isSelected = dateStr === selectedDate;
                                    const isToday = dateStr === getLocalDateString(new Date());
                                    
                                    // Calculate dots for this day
                                    const dayTasks = data.tasks.filter(t => getLocalDateString(new Date(t.date)) === dateStr);
                                    const hasTasks = dayTasks.length > 0;
                                    const allDone = hasTasks && dayTasks.every(t => t.completed);

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDate(dateStr)}
                                            className={`flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-300 ${
                                                isSelected
                                                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20 scale-105'
                                                    : isToday
                                                        ? 'bg-primary-50/50 dark:bg-primary-950/10 border border-primary-500/30 text-primary-600 dark:text-primary-400'
                                                        : 'hover:bg-dark-50 dark:hover:bg-dark-850/50 border border-transparent text-dark-700 dark:text-dark-300'
                                            }`}
                                        >
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                isSelected ? 'text-primary-100' : 'text-dark-400 dark:text-dark-550'
                                            }`}>
                                                {day.toLocaleDateString(undefined, { weekday: 'short' })}
                                            </span>
                                            <span className="text-lg font-black mt-1.5 leading-none font-display">
                                                {day.getDate()}
                                            </span>
                                            
                                            {/* Status Dot */}
                                            {hasTasks && (
                                                <span className={`w-1.5 h-1.5 rounded-full mt-2 ${
                                                    isSelected 
                                                        ? 'bg-white' 
                                                        : allDone 
                                                            ? 'bg-emerald-500' 
                                                            : 'bg-amber-500'
                                                }`} />
                                            )}
                                            {!hasTasks && <span className="w-1.5 h-1.5 mt-2" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Day Progress & Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-dark-900/40 p-5 rounded-2xl border border-dark-200/50 dark:border-dark-800">
                                <div className="flex-1">
                                    <h3 className="font-bold text-dark-900 dark:text-white text-base">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>
                                    {filteredTasks.length > 0 ? (
                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="flex-1 max-w-[240px] bg-dark-200 dark:bg-dark-800 h-2 rounded-full overflow-hidden">
                                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-550" style={{ width: `${dayPercent}%` }}></div>
                                            </div>
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450 font-mono">
                                                {dayCompleted}/{dayTotal} Done ({dayPercent}%)
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-dark-450 mt-1">No tasks scheduled for today.</p>
                                    )}
                                </div>
                                
                                <Button onClick={() => openAddModal('task')} className="flex items-center gap-2 self-start md:self-auto">
                                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Daily Task
                                </Button>
                            </div>

                            {/* Tasks List */}
                            <div className="space-y-3">
                                {filteredTasks.map((task) => (
                                    <Card 
                                        key={task._id} 
                                        className={`p-4 bg-white dark:bg-dark-900 border transition-all ${
                                            task.completed 
                                                ? 'border-emerald-500/10 dark:border-emerald-950/20 bg-emerald-50/5 dark:bg-emerald-950/5' 
                                                : 'border-dark-200/50 dark:border-dark-800'
                                        }`} 
                                        hover={false}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Styled Checkbox */}
                                            <button
                                                onClick={() => handleToggleTask(task)}
                                                className={`w-5.5 h-5.5 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer mt-0.5 ${
                                                    task.completed
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : 'border-dark-300 dark:border-dark-700 hover:border-primary-500'
                                                }`}
                                            >
                                                {task.completed && (
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <h4 className={`font-bold text-dark-900 dark:text-white leading-snug ${
                                                        task.completed ? 'line-through text-dark-450 dark:text-dark-500' : ''
                                                    }`}>
                                                        {task.title}
                                                    </h4>
                                                    
                                                    {/* Category Badge */}
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${getCategoryBadgeColor(task.category)}`}>
                                                        {task.category}
                                                    </span>

                                                    {/* Priority Badge */}
                                                    <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider ${getTaskPriorityBadge(task.priority)}`}>
                                                        {getTaskPriorityLabel(task.priority)} Priority
                                                    </span>
                                                </div>

                                                {task.description && (
                                                    <p className={`text-xs mt-1 leading-relaxed ${
                                                        task.completed ? 'text-dark-400 dark:text-dark-550' : 'text-dark-500 dark:text-dark-400'
                                                    }`}>
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEditModal('task', task)}
                                                    className="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/25 rounded-lg cursor-pointer transition-colors"
                                                    title="Edit task"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete('task', task._id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/25 rounded-lg cursor-pointer transition-colors"
                                                    title="Delete task"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                {filteredTasks.length === 0 && (
                                    <div className="text-center py-16 text-dark-500 bg-white/40 dark:bg-dark-900/40 rounded-2xl border border-dark-200/50 dark:border-dark-800">
                                        <svg className="w-12 h-12 text-dark-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                        </svg>
                                        <h3 className="font-bold text-dark-700 dark:text-dark-300">No tasks scheduled</h3>
                                        <p className="text-sm text-dark-400 max-w-sm mx-auto mt-1">Get organized! Schedule topics, coding questions or personal tasks for this day.</p>
                                        <Button onClick={() => openAddModal('task')} className="mt-4 text-xs font-semibold py-2">
                                            Add First Task
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {!isAdmin && activeTab === 'dsaStats' && (
                    <div className="animate-fade-in grid md:grid-cols-3 gap-6">
                        {/* Overall circular stats */}
                        <Card className="p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 flex flex-col items-center justify-center text-center" hover={false}>
                            <h3 className="font-bold text-dark-900 dark:text-white font-display mb-4">Overall Completion</h3>
                            
                            {/* Radial Progress Ring */}
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="68"
                                        className="text-dark-200 dark:text-dark-800"
                                        strokeWidth="12"
                                        stroke="currentColor"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="68"
                                        className="text-primary-500"
                                        strokeWidth="12"
                                        strokeDasharray={2 * Math.PI * 68}
                                        strokeDashoffset={2 * Math.PI * 68 * (1 - dsaPercent / 100)}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center justify-center">
                                    <span className="text-3xl font-extrabold text-dark-900 dark:text-white">{dsaPercent}%</span>
                                    <span className="text-xs font-semibold text-dark-450 tracking-wide uppercase mt-0.5">Finished</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <span className="text-2xl font-black text-dark-900 dark:text-white font-display">{completedDsa}</span>
                                <span className="text-sm font-semibold text-dark-400"> / {totalDsa} Solved</span>
                            </div>
                        </Card>

                        {/* Difficulty breakdown */}
                        <Card className="col-span-2 p-6 bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 flex flex-col justify-between" hover={false}>
                            <div>
                                <h3 className="font-bold text-lg text-dark-900 dark:text-white font-display mb-6">Difficulty Breakdown</h3>
                                
                                <div className="space-y-6">
                                    {/* Easy */}
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1.5">
                                            <span className="font-semibold text-emerald-500 flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                                Easy Questions
                                            </span>
                                            <span className="font-mono text-dark-600 dark:text-dark-300 font-bold">{easyCompleted}/{easyQs.length} ({easyPercent}%)</span>
                                        </div>
                                        <div className="w-full bg-dark-100 dark:bg-dark-800 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full rounded-full transition-all duration-550" style={{ width: `${easyPercent}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Medium */}
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1.5">
                                            <span className="font-semibold text-amber-500 flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                                Medium Questions
                                            </span>
                                            <span className="font-mono text-dark-600 dark:text-dark-300 font-bold">{mediumCompleted}/{mediumQs.length} ({mediumPercent}%)</span>
                                        </div>
                                        <div className="w-full bg-dark-100 dark:bg-dark-800 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-amber-500 h-full rounded-full transition-all duration-550" style={{ width: `${mediumPercent}%` }}></div>
                                        </div>
                                    </div>

                                    {/* Hard */}
                                    <div>
                                        <div className="flex justify-between items-center text-sm mb-1.5">
                                            <span className="font-semibold text-rose-500 flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                                Hard Questions
                                            </span>
                                            <span className="font-mono text-dark-600 dark:text-dark-300 font-bold">{hardCompleted}/{hardQs.length} ({hardPercent}%)</span>
                                        </div>
                                        <div className="w-full bg-dark-100 dark:bg-dark-800 h-2.5 rounded-full overflow-hidden">
                                            <div className="bg-rose-500 h-full rounded-full transition-all duration-550" style={{ width: `${hardPercent}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-5 border-t border-dark-100 dark:border-dark-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <p className="text-xs text-dark-400">Keep solving questions from the practice list to push these metrics higher!</p>
                                <Link to="/learning" className="btn-primary text-xs py-2 px-4 shadow-md flex items-center gap-1.5">
                                    <span>Practice DSA Now</span>
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                        </Card>
                    </div>
                )}


                {/* ======================================================== */}
                {/* DIALOG / MODAL                                           */}
                {/* ======================================================== */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/60 backdrop-blur-sm">
                        <Card className="w-full max-w-lg p-6 bg-white dark:bg-dark-900 border border-dark-250/20 shadow-2xl relative overflow-hidden" hover={false}>
                            {/* Decorative background glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

                            <div className="flex items-center justify-between mb-5 border-b border-dark-100 dark:border-dark-800 pb-3">
                                <h2 className="text-xl font-bold text-dark-900 dark:text-white font-display">
                                    {editItem ? 'Edit' : 'Add'} {
                                        modalType === 'project' ? 'Project' : 
                                        modalType === 'certificate' ? 'Certificate' : 
                                        'Roadmap Topic'
                                    }
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-800 rounded-lg cursor-pointer transition-colors"
                                >
                                    <svg className="w-5 h-5 text-dark-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                                {modalType === 'project' && (
                                    <>
                                        <Input
                                            label="Title"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="Description"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            textarea
                                            rows={3}
                                            required
                                        />
                                        <Input
                                            label="Tech Stack (comma separated)"
                                            value={Array.isArray(formData.techStack) ? formData.techStack.join(', ') : formData.techStack || ''}
                                            onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                            placeholder="React, Node.js, MongoDB"
                                        />
                                        <Input
                                            label="GitHub Link"
                                            value={formData.githubLink || ''}
                                            onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                                        />
                                        <Input
                                            label="Live Demo URL"
                                            value={formData.liveDemo || ''}
                                            onChange={(e) => setFormData({ ...formData, liveDemo: e.target.value })}
                                        />
                                        <div>
                                            <label className="label">Project Image</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setUploading(true);
                                                            try {
                                                                const res = await uploadAPI.uploadImage(file);
                                                                setFormData({ ...formData, image: res.data.data.imageUrl });
                                                                setImagePreview(URL.createObjectURL(file));
                                                            } catch (error) {
                                                                console.error('Upload failed:', error);
                                                                alert('Failed to upload image');
                                                            } finally {
                                                                setUploading(false);
                                                            }
                                                        }
                                                    }}
                                                    className="input text-sm cursor-pointer"
                                                    disabled={uploading}
                                                />
                                                {uploading && <span className="text-sm text-primary-500 animate-pulse">Uploading...</span>}
                                            </div>
                                            {(imagePreview || formData.image) && (
                                                <img
                                                    src={imagePreview || `http://localhost:5000${formData.image}`}
                                                    alt="Preview"
                                                    className="mt-2 w-32 h-20 object-cover rounded-lg border border-dark-250/20"
                                                />
                                            )}
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured || false}
                                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                className="rounded border-dark-300 dark:border-dark-700 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                            />
                                            <span className="text-sm font-semibold text-dark-700 dark:text-dark-300">Featured project</span>
                                        </label>
                                    </>
                                )}

                                {modalType === 'certificate' && (
                                    <>
                                        <Input
                                            label="Certificate Name"
                                            value={formData.name || ''}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="Issuer"
                                            value={formData.issuer || ''}
                                            onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="Issue Date"
                                            type="date"
                                            value={formData.issueDate ? formData.issueDate.split('T')[0] : ''}
                                            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="Credential URL"
                                            value={formData.credentialUrl || ''}
                                            onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                                        />
                                        <div>
                                            <label className="label">Certificate Image</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            setUploading(true);
                                                            try {
                                                                const res = await uploadAPI.uploadImage(file);
                                                                setFormData({ ...formData, image: res.data.data.imageUrl });
                                                                setImagePreview(URL.createObjectURL(file));
                                                            } catch (error) {
                                                                console.error('Upload failed:', error);
                                                                alert('Failed to upload image');
                                                            } finally {
                                                                setUploading(false);
                                                            }
                                                        }
                                                    }}
                                                    className="input text-sm cursor-pointer"
                                                    disabled={uploading}
                                                />
                                                {uploading && <span className="text-sm text-primary-500 animate-pulse">Uploading...</span>}
                                            </div>
                                            {(imagePreview || formData.image) && (
                                                <img
                                                    src={imagePreview || `http://localhost:5000${formData.image}`}
                                                    alt="Preview"
                                                    className="mt-2 w-32 h-20 object-cover rounded-lg border border-dark-250/20"
                                                />
                                            )}
                                        </div>
                                    </>
                                )}

                                {modalType === 'learningTopic' && (
                                    <>
                                        <Input
                                            label="Topic Title"
                                            placeholder="e.g. Master React Context API, Spring Boot Security"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="label text-xs font-bold text-dark-700 dark:text-dark-300 uppercase tracking-wider mb-1.5 block">Category</label>
                                                <select
                                                    value={formData.category || 'Other'}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full text-sm py-2 px-3 bg-dark-50 dark:bg-dark-850 border border-dark-200 dark:border-dark-850 rounded-xl text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
                                                >
                                                    <option value="Frontend">Frontend</option>
                                                    <option value="Backend">Backend</option>
                                                    <option value="DSA">DSA</option>
                                                    <option value="System Design">System Design</option>
                                                    <option value="DevOps">DevOps</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label text-xs font-bold text-dark-700 dark:text-dark-300 uppercase tracking-wider mb-1.5 block">Priority (1-5)</label>
                                                <select
                                                    value={formData.priority || 3}
                                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                                    className="w-full text-sm py-2 px-3 bg-dark-50 dark:bg-dark-850 border border-dark-200 dark:border-dark-850 rounded-xl text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
                                                >
                                                    <option value={5}>5 - Highest Priority</option>
                                                    <option value={4}>4 - High Priority</option>
                                                    <option value={3}>3 - Medium Priority</option>
                                                    <option value={2}>2 - Low Priority</option>
                                                    <option value={1}>1 - Lowest Priority</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label text-xs font-bold text-dark-700 dark:text-dark-300 uppercase tracking-wider mb-1.5 block">Status</label>
                                            <select
                                                value={formData.status || 'not-started'}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full text-sm py-2 px-3 bg-dark-50 dark:bg-dark-850 border border-dark-200 dark:border-dark-850 rounded-xl text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
                                            >
                                                <option value="not-started">Not Started</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        <Input
                                            label="Brief Description"
                                            placeholder="What is this module about?"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            textarea
                                            rows={2.5}
                                        />
                                        <Input
                                            label="Study Notes / Resources"
                                            placeholder="Key links, notes, core details..."
                                            value={formData.notes || ''}
                                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                            textarea
                                            rows={4}
                                        />
                                    </>
                                )}

                                {modalType === 'task' && (
                                    <>
                                        <Input
                                            label="Task Title"
                                            placeholder="e.g. Solve 3 Leetcode questions, Design database schema"
                                            value={formData.title || ''}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                        <Input
                                            label="Task Date"
                                            type="date"
                                            value={formData.date ? formData.date.split('T')[0] : ''}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            required
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="label text-xs font-bold text-dark-700 dark:text-dark-300 uppercase tracking-wider mb-1.5 block">Category</label>
                                                <select
                                                    value={formData.category || 'Other'}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full text-sm py-2 px-3 bg-dark-50 dark:bg-dark-850 border border-dark-200 dark:border-dark-850 rounded-xl text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
                                                >
                                                    <option value="Frontend">Frontend</option>
                                                    <option value="Backend">Backend</option>
                                                    <option value="DSA">DSA</option>
                                                    <option value="System Design">System Design</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label text-xs font-bold text-dark-700 dark:text-dark-300 uppercase tracking-wider mb-1.5 block">Priority</label>
                                                <select
                                                    value={formData.priority || 2}
                                                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                                    className="w-full text-sm py-2 px-3 bg-dark-50 dark:bg-dark-850 border border-dark-200 dark:border-dark-850 rounded-xl text-dark-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all cursor-pointer"
                                                >
                                                    <option value={3}>High Priority</option>
                                                    <option value={2}>Medium Priority</option>
                                                    <option value={1}>Low Priority</option>
                                                </select>
                                            </div>
                                        </div>
                                        <Input
                                            label="Task Description"
                                            placeholder="What exactly needs to be done?"
                                            value={formData.description || ''}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            textarea
                                            rows={3}
                                        />
                                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.completed || false}
                                                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                                                className="rounded border-dark-300 dark:border-dark-700 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                            />
                                            <span className="text-sm font-semibold text-dark-700 dark:text-dark-300">Mark as completed</span>
                                        </label>
                                    </>
                                )}

                                <div className="flex gap-3 pt-4 border-t border-dark-100 dark:border-dark-800 mt-5">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 cursor-pointer py-2.5"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={submitting}
                                        className="flex-1 cursor-pointer py-2.5"
                                    >
                                        {editItem 
                                            ? `Update ${modalType === 'learningTopic' ? 'Topic' : modalType === 'project' ? 'Project' : modalType === 'certificate' ? 'Certificate' : 'Task'}` 
                                            : `Create ${modalType === 'learningTopic' ? 'Topic' : modalType === 'project' ? 'Project' : modalType === 'certificate' ? 'Certificate' : 'Task'}`
                                        }
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                {toast && (
                    <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-lg animate-fade-in flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="font-semibold text-sm">{toast}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
