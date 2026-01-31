import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { learningResourcesAPI, learningAPI } from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

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

const Learning = () => {
    const { isAuthenticated, isAdmin } = useAuth();
    const [resources, setResources] = useState([]);
    const [learningTopics, setLearningTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        fetchData();
    }, [isAdmin]);

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

            // If admin, also fetch learning topics
            if (isAdmin) {
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

    if (loading) return <Loading fullScreen />;

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium mb-6">
                        Learning Resources
                    </span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-dark-900 dark:text-white mb-6">
                        Start Your Learning Journey
                    </h1>
                    <p className="text-xl text-dark-500 dark:text-dark-400 max-w-2xl mx-auto">
                        Curated resources for DSA, System Design, Backend, Frontend, and more.
                        Everything you need to level up your skills.
                    </p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${activeCategory === cat.id
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
                                className="card p-6 hover:scale-105 transition-transform duration-300 group"
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
                <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-3xl p-8 md:p-12 text-center text-white">
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
                            className="px-6 py-3 bg-white text-primary-600 font-medium rounded-xl hover:bg-white/90 transition-colors flex items-center"
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
                            className="px-6 py-3 bg-white/20 text-white font-medium rounded-xl hover:bg-white/30 transition-colors flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                            </svg>
                            LeetCode Profile
                        </a>
                    </div>
                </div>

                {/* Admin Section - Learning Tracker */}
                {isAdmin && (
                    <div className="mt-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-dark-900 dark:text-white">
                                My Learning Tracker
                            </h2>
                            <Link to="/dashboard" className="btn-primary text-sm">
                                Manage in Dashboard
                            </Link>
                        </div>

                        {learningTopics.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {learningTopics.slice(0, 6).map((topic) => (
                                    <Card key={topic._id} className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium text-dark-900 dark:text-white">
                                                {topic.title}
                                            </h4>
                                            <span className={`badge text-xs ${topic.status === 'COMPLETED' ? 'badge-success' :
                                                topic.status === 'IN_PROGRESS' ? 'badge-warning' :
                                                    'badge-gray'
                                                }`}>
                                                {topic.status.replace('_', ' ')}
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
                            <Card className="p-8 text-center">
                                <p className="text-dark-500 dark:text-dark-400">
                                    No learning topics yet. Add them from the Dashboard.
                                </p>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Learning;
