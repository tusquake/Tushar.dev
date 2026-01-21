import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { learningAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';
import { Link } from 'react-router-dom';

const Learning = () => {
    const { isAuthenticated } = useAuth();
    const [topics, setTopics] = useState([]);
    const [grouped, setGrouped] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTopic, setNewTopic] = useState({
        title: '',
        category: 'Frontend',
        description: '',
        status: 'not-started',
        priority: 3,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const categories = ['Frontend', 'Backend', 'DSA', 'System Design', 'DevOps', 'Other'];

    const statusConfig = {
        'not-started': { label: 'Not Started', color: 'badge-gray', icon: '⏳' },
        'in-progress': { label: 'In Progress', color: 'badge-warning', icon: '🔄' },
        'completed': { label: 'Completed', color: 'badge-success', icon: '✅' },
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchTopics();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchTopics = async () => {
        try {
            const response = await learningAPI.getAll();
            setTopics(response.data.data);
            setGrouped(response.data.grouped || {});
        } catch (error) {
            console.error('Failed to fetch topics:', error);
            setError(error.response?.data?.message || 'Failed to fetch learning topics');
        } finally {
            setLoading(false);
        }
    };

    const handleAddTopic = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await learningAPI.create(newTopic);
            setNewTopic({
                title: '',
                category: 'Frontend',
                description: '',
                status: 'not-started',
                priority: 3,
            });
            setShowAddModal(false);
            fetchTopics();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to add topic');
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (topicId, newStatus) => {
        try {
            await learningAPI.updateStatus(topicId, newStatus);
            fetchTopics();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDelete = async (topicId) => {
        if (!confirm('Are you sure you want to delete this topic?')) return;

        try {
            await learningAPI.delete(topicId);
            fetchTopics();
        } catch (error) {
            console.error('Failed to delete topic:', error);
        }
    };

    const filteredTopics = activeCategory === 'all'
        ? topics
        : topics.filter(t => t.category === activeCategory);

    // Calculate progress stats
    const stats = {
        total: topics.length,
        completed: topics.filter(t => t.status === 'completed').length,
        inProgress: topics.filter(t => t.status === 'in-progress').length,
        notStarted: topics.filter(t => t.status === 'not-started').length,
    };
    const progressPercent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    if (loading) return <Loading fullScreen />;

    // Not authenticated view
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <span className="text-6xl mb-6 block">📚</span>
                    <h1 className="text-3xl font-display font-bold text-dark-900 dark:text-white mb-4">
                        Learning Tracker
                    </h1>
                    <p className="text-dark-500 dark:text-dark-400 mb-8">
                        Sign in to access your personal learning roadmap and track your progress across
                        different topics and categories.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/login" className="btn-primary">
                            Sign In
                        </Link>
                        <Link to="/register" className="btn-secondary">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="section-title">Learning Roadmap</h1>
                        <p className="mt-2 text-dark-500 dark:text-dark-400">
                            Track your learning journey and progress
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 md:mt-0"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Topic
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="p-4 text-center" hover={false}>
                        <p className="text-3xl font-bold text-primary-500">{stats.total}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">Total Topics</p>
                    </Card>
                    <Card className="p-4 text-center" hover={false}>
                        <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">Completed</p>
                    </Card>
                    <Card className="p-4 text-center" hover={false}>
                        <p className="text-3xl font-bold text-yellow-500">{stats.inProgress}</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">In Progress</p>
                    </Card>
                    <Card className="p-4 text-center" hover={false}>
                        <p className="text-3xl font-bold text-dark-500">{progressPercent}%</p>
                        <p className="text-sm text-dark-500 dark:text-dark-400">Progress</p>
                    </Card>
                </div>

                {/* Progress bar */}
                {stats.total > 0 && (
                    <div className="mb-8">
                        <div className="h-3 bg-dark-100 dark:bg-dark-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Category filters */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeCategory === 'all'
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeCategory === cat
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Topics list */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {filteredTopics.map((topic) => (
                        <Card key={topic._id} className="p-4" hover={false}>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-dark-900 dark:text-white">
                                            {topic.title}
                                        </h3>
                                        <span className={`badge ${statusConfig[topic.status].color}`}>
                                            {statusConfig[topic.status].icon} {statusConfig[topic.status].label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-dark-500 dark:text-dark-400 mb-2">
                                        {topic.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-dark-400">
                                        <span className="badge badge-primary">{topic.category}</span>
                                        <span>Priority: {'⭐'.repeat(topic.priority)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={topic.status}
                                        onChange={(e) => handleStatusChange(topic._id, e.target.value)}
                                        className="input py-2 text-sm"
                                    >
                                        <option value="not-started">Not Started</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                    <button
                                        onClick={() => handleDelete(topic._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Empty state */}
                {filteredTopics.length === 0 && (
                    <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">📝</span>
                        <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                            No topics yet
                        </h3>
                        <p className="text-dark-500 dark:text-dark-400 mb-6">
                            Start adding topics to track your learning progress
                        </p>
                        <Button onClick={() => setShowAddModal(true)}>
                            Add Your First Topic
                        </Button>
                    </div>
                )}

                {/* Add Topic Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm">
                        <Card className="w-full max-w-md p-6" hover={false}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
                                    Add Learning Topic
                                </h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleAddTopic} className="space-y-4">
                                <Input
                                    label="Topic Title"
                                    value={newTopic.title}
                                    onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                                    placeholder="e.g., React Hooks"
                                    required
                                />

                                <div>
                                    <label className="label">Category</label>
                                    <select
                                        value={newTopic.category}
                                        onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                                        className="input"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <Input
                                    label="Description"
                                    value={newTopic.description}
                                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                                    placeholder="Brief description of the topic"
                                    textarea
                                    rows={3}
                                />

                                <div>
                                    <label className="label">Priority (1-5)</label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        value={newTopic.priority}
                                        onChange={(e) => setNewTopic({ ...newTopic, priority: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-sm text-dark-400">
                                        <span>Low</span>
                                        <span>{'⭐'.repeat(newTopic.priority)}</span>
                                        <span>High</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={submitting}
                                        className="flex-1"
                                    >
                                        Add Topic
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Learning;
