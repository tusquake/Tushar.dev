import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, certificatesAPI, contactAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loading from '../components/common/Loading';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('projects');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        projects: [],
        certificates: [],
        contacts: [],
    });

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [projectsRes, certificatesRes, contactsRes] = await Promise.all([
                projectsAPI.getAll(),
                certificatesAPI.getAll(),
                contactAPI.getAll(),
            ]);

            setData({
                projects: projectsRes.data.data || [],
                certificates: certificatesRes.data.data || [],
                contacts: contactsRes.data.data || [],
            });
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
        setShowModal(true);
    };

    const openEditModal = (type, item) => {
        setModalType(type);
        setEditItem(item);
        setFormData(item);
        setShowModal(true);
    };

    const getEmptyForm = (type) => {
        switch (type) {
            case 'project':
                return { title: '', description: '', techStack: '', githubLink: '', liveDemo: '', featured: false };
            case 'certificate':
                return { name: '', issuer: '', issueDate: '', credentialUrl: '' };
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
                }
            } else {
                if (modalType === 'project') {
                    await projectsAPI.create(payload);
                } else if (modalType === 'certificate') {
                    await certificatesAPI.create(payload);
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
            }
            fetchAllData();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const tabs = [
        { id: 'projects', label: 'Projects', count: data.projects.length },
        { id: 'certificates', label: 'Certificates', count: data.certificates.length },
        { id: 'contacts', label: 'Messages', count: data.contacts.length },
    ];

    if (loading) return <Loading fullScreen />;

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="section-title">Dashboard</h1>
                    <p className="mt-2 text-dark-500 dark:text-dark-400">
                        Welcome back, {user?.name}! Manage your portfolio content here.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {tabs.map((tab) => (
                        <Card key={tab.id} className="p-4 text-center cursor-pointer" hover onClick={() => setActiveTab(tab.id)}>
                            <p className="text-3xl font-bold text-primary-500">{tab.count}</p>
                            <p className="text-sm text-dark-500 dark:text-dark-400">{tab.label}</p>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-dark-200 dark:border-dark-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-medium transition-all relative ${activeTab === tab.id
                                    ? 'text-primary-500'
                                    : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-300'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'projects' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => openAddModal('project')}>
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Project
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.projects.map((project) => (
                                <Card key={project._id} className="p-4" hover={false}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-dark-900 dark:text-white">{project.title}</h3>
                                            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">{project.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                {project.techStack?.map((tech) => (
                                                    <span key={tech} className="badge badge-primary text-xs">{tech}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal('project', project)}
                                                className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete('project', project._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
                                <div className="text-center py-12 text-dark-500">
                                    No projects yet. Add your first project!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'certificates' && (
                    <div>
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => openAddModal('certificate')}>
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Certificate
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {data.certificates.map((cert) => (
                                <Card key={cert._id} className="p-4" hover={false}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-dark-900 dark:text-white">{cert.name}</h3>
                                            <p className="text-sm text-primary-500">{cert.issuer}</p>
                                            <p className="text-sm text-dark-500 dark:text-dark-400 mt-1">
                                                {new Date(cert.issueDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openEditModal('certificate', cert)}
                                                className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete('certificate', cert._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
                                <div className="text-center py-12 text-dark-500">
                                    No certificates yet. Add your first certificate!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'contacts' && (
                    <div className="space-y-4">
                        {data.contacts.map((contact) => (
                            <Card key={contact._id} className="p-4" hover={false}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-dark-900 dark:text-white">{contact.name}</h3>
                                            {!contact.read && (
                                                <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">New</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-primary-500">{contact.email}</p>
                                        {contact.subject && (
                                            <p className="text-sm font-medium text-dark-700 dark:text-dark-300 mt-1">
                                                {contact.subject}
                                            </p>
                                        )}
                                        <p className="text-sm text-dark-500 dark:text-dark-400 mt-2">
                                            {contact.message}
                                        </p>
                                        <p className="text-xs text-dark-400 mt-2">
                                            {new Date(contact.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete('contact', contact._id)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </Card>
                        ))}
                        {data.contacts.length === 0 && (
                            <div className="text-center py-12 text-dark-500">
                                No contact messages yet.
                            </div>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-900/50 backdrop-blur-sm">
                        <Card className="w-full max-w-lg p-6" hover={false}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
                                    {editItem ? 'Edit' : 'Add'} {modalType === 'project' ? 'Project' : 'Certificate'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-dark-100 dark:hover:bg-dark-700 rounded-lg"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={formData.featured || false}
                                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                                                className="rounded"
                                            />
                                            <span className="text-sm text-dark-700 dark:text-dark-300">Featured project</span>
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
                                    </>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        loading={submitting}
                                        className="flex-1"
                                    >
                                        {editItem ? 'Update' : 'Create'}
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

export default Dashboard;
