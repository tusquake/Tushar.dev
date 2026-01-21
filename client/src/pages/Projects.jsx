import { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Sample projects data (will be replaced by API data)
    const sampleProjects = [
        {
            _id: '1',
            title: 'E-Commerce Platform',
            description: 'A full-featured e-commerce platform with payment integration, inventory management, and real-time analytics dashboard.',
            techStack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
            githubLink: 'https://github.com',
            liveDemo: 'https://example.com',
            featured: true,
        },
        {
            _id: '2',
            title: 'Task Management App',
            description: 'A collaborative task management application with real-time updates, team features, and productivity analytics.',
            techStack: ['React', 'Express', 'PostgreSQL', 'Socket.io'],
            githubLink: 'https://github.com',
            liveDemo: 'https://example.com',
            featured: true,
        },
        {
            _id: '3',
            title: 'Weather Dashboard',
            description: 'A beautiful weather dashboard with 7-day forecasts, location search, and interactive weather maps.',
            techStack: ['React', 'OpenWeather API', 'Chart.js'],
            githubLink: 'https://github.com',
            liveDemo: 'https://example.com',
            featured: false,
        },
        {
            _id: '4',
            title: 'Blog Platform',
            description: 'A modern blog platform with markdown support, comments, and social sharing features.',
            techStack: ['Next.js', 'MongoDB', 'MDX'],
            githubLink: 'https://github.com',
            featured: false,
        },
    ];

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await projectsAPI.getAll();
                if (response.data.data.length > 0) {
                    setProjects(response.data.data);
                } else {
                    setProjects(sampleProjects);
                }
            } catch (error) {
                console.log('Using sample projects');
                setProjects(sampleProjects);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const filteredProjects = filter === 'all'
        ? projects
        : filter === 'featured'
            ? projects.filter(p => p.featured)
            : projects;

    const allTechStacks = [...new Set(projects.flatMap(p => p.techStack))];

    if (loading) return <Loading fullScreen />;

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="section-title">My Projects</h1>
                    <p className="mt-4 section-subtitle mx-auto">
                        A collection of projects I've worked on, showcasing my skills and experience
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                            }`}
                    >
                        All Projects
                    </button>
                    <button
                        onClick={() => setFilter('featured')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'featured'
                                ? 'bg-primary-500 text-white'
                                : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                            }`}
                    >
                        Featured
                    </button>
                </div>

                {/* Projects Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {filteredProjects.map((project, index) => (
                        <Card
                            key={project._id}
                            className="p-0 overflow-hidden group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Project image placeholder */}
                            <div className="h-48 bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
                                <span className="text-6xl opacity-50">🚀</span>
                                <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    {project.githubLink && (
                                        <a
                                            href={project.githubLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                            </svg>
                                        </a>
                                    )}
                                    {project.liveDemo && (
                                        <a
                                            href={project.liveDemo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                                        >
                                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    )}
                                </div>
                                {project.featured && (
                                    <span className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                                    {project.title}
                                </h3>
                                <p className="text-dark-500 dark:text-dark-400 mb-4 line-clamp-2">
                                    {project.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech) => (
                                        <span
                                            key={tech}
                                            className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm rounded-full"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Empty state */}
                {filteredProjects.length === 0 && (
                    <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">📭</span>
                        <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                            No projects found
                        </h3>
                        <p className="text-dark-500 dark:text-dark-400">
                            Check back later for new projects!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;
