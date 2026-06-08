import { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

// Server URL for static files (without /api suffix)
const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const getImageUrl = (imagePath) => {
        if (!imagePath) return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        if (imagePath.startsWith('/projects/') || imagePath.startsWith('/images/')) {
            return imagePath;
        }
        return `${SERVER_URL}${imagePath}`;
    };

    // Sample projects data (will be replaced by API data)
    const sampleProjects = [
        {
            _id: '1',
            title: 'HomeGenie - Smart Maintenance Management System',
            description: 'An AI-powered maintenance platform with an integrated Voice Assistant. Architected with separate User, Maintenance, and Voice AI microservices. Integrates FastAPI, Gemini 2.0 Flash, Hugging Face, and Google Speech Recognition for real-time intent detection, speech processing, and automated issue classification. Deployed on AWS Elastic Beanstalk.',
            techStack: ['Spring Boot', 'Microservices', 'React', 'Tailwind CSS', 'FastAPI', 'PostgreSQL', 'AWS S3', 'Gemini API'],
            githubLink: 'https://github.com/tusquake/HomeGenie',
            liveDemo: 'https://homegenie-ucu3.onrender.com/',
            image: '/projects/homegenie.png',
            featured: true,
        },
        {
            _id: '2',
            title: 'SpendWise - AI-Powered Expense Tracker',
            description: 'An AI-powered expense tracker featuring automatic categorization using the Gemini API. Implements OAuth 2.0 security, rate limiting, circuit breaker pattern with fallbacks, and in-memory caching to achieve 40% faster response times.',
            techStack: ['Spring Boot', 'OAuth 2.0', 'Spring Security', 'React', 'PostgreSQL', 'Tailwind CSS', 'Gemini API'],
            githubLink: 'https://github.com/tusquake/SpendWise',
            liveDemo: 'https://spendwise-1-bcdd.onrender.com/',
            image: '/projects/spendwise.png',
            featured: true,
        },
        {
            _id: '3',
            title: 'SocialGraph Recommendation & Fraud Engine',
            description: 'High-throughput social network analysis platform that evaluates relationships, identifies real-time community rings, detects anomalous connection patterns for fraud prevention, and generates personalized connection recommendations using graph theory.',
            techStack: ['Neo4j', 'Python', 'FastAPI', 'Redis', 'Docker', 'GraphQL'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/SocialGraph-Recommendation-Engine',
            image: '/projects/socialgraph.png',
            featured: true,
        },
        {
            _id: '4',
            title: 'Global Distributed Rate Limiter',
            description: 'A highly scalable, multi-region distributed rate limiting system implementing Token Bucket and Sliding Window algorithms. Features low-latency synchronization across edge nodes and seamless failover resilience.',
            techStack: ['Go', 'Redis', 'gRPC', 'Envoy', 'Docker', 'Prometheus'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Global-Rate-Limiter',
            image: '/projects/ratelimiter.png',
            featured: true,
        },
        {
            _id: '5',
            title: 'Advanced Search & Intelligence Engine',
            description: 'An intelligent search platform featuring full-text indexation, semantic search using vector embeddings, custom relevance scoring models, real-time analytics, and instant typo tolerance.',
            techStack: ['Elasticsearch', 'Python', 'Logstash', 'Kibana', 'FastAPI', 'Redis'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Advanced-Search-Engine',
            image: '/projects/search_engine.png',
            featured: true,
        },
        {
            _id: '6',
            title: 'Distributed Notification Service',
            description: 'A high-performance alert delivery system supporting push notifications, SMS, and email channels. Leverages partition key distribution, consumer groups, dead letter queues, and caching for sub-second delivery under peak load.',
            techStack: ['Spring Boot', 'Apache Kafka', 'Redis', 'WebSockets', 'Firebase', 'PostgreSQL'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Distributed-Notification-Service',
            image: '/projects/notification_service.png',
            featured: true,
        },
        {
            _id: '7',
            title: 'Distributed Ledger & Atomic Transfers',
            description: 'An immutable double-entry distributed ledger system with support for multi-party atomic transfers. Implements strict serializable transaction isolation, transaction signing, and complete audit trail logging.',
            techStack: ['Node.js', 'Redis', 'PostgreSQL', 'Docker', 'TypeScript'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Distributed-Ledger-System',
            image: '/projects/ledger.png',
            featured: true,
        },
        {
            _id: '8',
            title: 'High-Performance URL Shortener',
            description: 'A ultra-fast URL redirection service generating unique, short, human-readable tags using Base62 encoding. Utilizes bloom filters and caching strategies to minimize database lookup latencies.',
            techStack: ['Go', 'Redis', 'PostgreSQL', 'NGINX', 'Docker', 'Base62'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/url-shortener-system',
            image: '/projects/url_shortener.png',
            featured: false,
        },
        {
            _id: '9',
            title: 'GCS Signed URL & Media Delivery',
            description: 'Secure and optimized asset delivery pipeline utilizing Google Cloud Storage Signed URLs. Enforces time-bound asset authorization, automated cache expiration headers, and image resizing transformations.',
            techStack: ['Node.js', 'Google Cloud Storage', 'CDN', 'Express', 'React'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/gcs-signed-url-system',
            image: '/projects/gcs_media.png',
            featured: false,
        },
        {
            _id: '10',
            title: 'Ride-Sharing Geospatial Engine',
            description: 'High-frequency geospatial location tracking and matchmaker system for ride dispatching. Computes active driver densities using H3 spatial indexing and matches riders dynamically using cost distance metrics.',
            techStack: ['Go', 'Redis GEO', 'PostGIS', 'Kafka', 'WebSockets', 'React'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Ride-Sharing-Geospatial-System',
            image: '/projects/ride_sharing.png',
            featured: true,
        },
        {
            _id: '11',
            title: 'IoT Telemetry & Analytics Platform',
            description: 'A robust time-series ingestion and analytics platform designed to collect, process, and display telemetry logs from millions of IoT devices. Supports streaming aggregations and anomaly alerts.',
            techStack: ['Cassandra', 'Python', 'RabbitMQ', 'Grafana', 'InfluxDB', 'Docker'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/IoT-GCP-Cassandra-Telemetry',
            image: '/projects/iot_telemetry.png',
            featured: false,
        },
        {
            _id: '12',
            title: 'Collaborative Document Editor',
            description: 'A real-time collaborative text editor supporting simultaneous document modifications. Employs Conflict-free Replicated Data Types (CRDTs) to resolve update synchronization without server-side locking.',
            techStack: ['Node.js', 'Socket.io', 'Redis', 'Yjs', 'React'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Collaborative-Doc-Editor',
            image: '/projects/collab_editor.png',
            featured: true,
        },
        {
            _id: '13',
            title: 'Real-Time Traffic Simulation & Monitoring Platform',
            description: 'Visual urban traffic modeling platform simulating vehicle agents moving along road networks. Renders live heatmaps of congestion points and calculates optimal routing dynamically using A* search.',
            techStack: ['Python', 'React', 'Leaflet', 'WebSockets', 'FastAPI', 'Kafka'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Real-Time-Traffic-Sim-Map',
            image: '/projects/traffic_simulation.png',
            featured: false,
        },
        {
            _id: '14',
            title: 'Vortex Gaming Platform',
            description: 'A modern game distribution dashboard displaying storefronts, community feeds, online player indicators, achievement badges, and live match lobbies.',
            techStack: ['Spring Boot', 'GraphQL', 'PostgreSQL', 'Redis', 'React', 'Docker'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Vortex-Gaming-Platform',
            image: '/projects/vortex_gaming.png',
            featured: true,
        },
        {
            _id: '15',
            title: 'AI Collaboration Platform',
            description: 'Interactive collaborative canvas allowing teams to generate mindmaps, system architectures, and documentation notes synced live with an autonomous AI co-pilot agent.',
            techStack: ['React', 'Node.js', 'Gemini API', 'MongoDB', 'WebSockets', 'Tailwind'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/ai-collaboration-platform',
            image: '/projects/ai_collaboration.png',
            featured: true,
        },
        {
            _id: '16',
            title: 'CricStream: Real-Time Cricket Scoreboard',
            description: 'Ultra-low latency cricket matches tracker streaming ball-by-ball score updates, team tables, and live run charts to thousands of users simultaneously using Server-Sent Events.',
            techStack: ['React', 'Go', 'Redis Pub/Sub', 'SSE', 'PostgreSQL', 'Docker'],
            githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/cricstream',
            image: '/projects/cricstream.png',
            featured: true,
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
                            {/* Project image */}
                            <div className="h-48 bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
                                {project.image ? (
                                    <img
                                        src={getImageUrl(project.image)}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg className="w-16 h-16 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                )}
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
                        <svg className="w-16 h-16 mx-auto mb-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
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
