import { useState, useEffect } from 'react';
import { projectsAPI } from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

// Server URL for static files (without /api suffix)
const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const ProjectCover = ({ project }) => {
    // Generate a deterministically seeded set of colors based on project title
    const hashString = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const seed = hashString(project.title);
    const hue1 = seed % 360;
    const hue2 = (seed + 120) % 360;
    const hue3 = (seed + 240) % 360;

    const gradientStyle = {
        background: `radial-gradient(circle at 20% 30%, hsl(${hue1}, 75%, 30%), transparent 60%),
                    radial-gradient(circle at 80% 70%, hsl(${hue2}, 70%, 20%), transparent 65%),
                    radial-gradient(circle at 50% 50%, hsl(${hue3}, 65%, 15%), transparent 70%),
                    #0b0f19`
    };

    return (
        <div 
            className="w-full h-full flex flex-col justify-between p-5 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500" 
            style={gradientStyle}
        >
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            
            {/* Soft Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

            {/* Top Bar */}
            <div className="flex justify-between items-start z-10 w-full">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-white/10 text-white/95 backdrop-blur-md border border-white/10">
                    {project.techStack[0] || 'System Design'}
                </span>
                {project.featured && (
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        Featured
                    </span>
                )}
            </div>

            {/* Central Icon Representation */}
            <div className="flex justify-center items-center z-10 py-1">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300">
                    <span className="text-lg font-bold text-white uppercase select-none">
                        {project.title.substring(0, 2)}
                    </span>
                </div>
            </div>

            {/* Footer Stack Info */}
            <div className="flex gap-1.5 flex-wrap z-10 w-full">
                {project.techStack.slice(0, 3).map((tech, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-medium text-white/60">
                        #{tech}
                    </span>
                ))}
            </div>
        </div>
    );
};

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const getImageUrl = (imagePath) => {
        if (!imagePath || imagePath === 'undefined' || imagePath === 'null') return '';
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
        if (imagePath.startsWith('/projects/')) {
            return `https://storage.googleapis.com/galvanic-axle-474007-a2-media${imagePath}`;
        }
        if (imagePath.startsWith('/images/')) {
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
        {
            _id: '17',
            title: 'GeoTrakr',
            description: 'Real-time geo-tracking platform showcasing driver fleets, route histories, and geofencing triggers via microservices.',
            techStack: ['Go', 'Redis', 'PostgreSQL', 'WebSockets', 'Leaflet'],
            githubLink: 'https://github.com/tusquake/GeoTrakr',
            image: '/projects/geotrakr.png',
            featured: true,
        },
        {
            _id: '18',
            title: 'Production Sequencing Manager',
            description: 'An enterprise-grade production scheduler utilizing sorting rules (EDD, SPT, LPT) and order prioritization pipelines.',
            techStack: ['React', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Tailwind CSS'],
            githubLink: 'https://github.com/tusquake/Production-Sequencing-Manager',
            image: '/projects/production_sequencing.png',
            featured: true,
        },
        {
            _id: '19',
            title: 'env-validator',
            description: 'Lightweight configuration verification module checking schema correctness, default fallbacks, and missing production variables.',
            techStack: ['TypeScript', 'Node.js', 'npm', 'Jest', 'CI/CD'],
            githubLink: 'https://github.com/tusquake/env-validator',
            image: '/projects/env_validator.png',
            featured: false,
        },
        {
            _id: '20',
            title: 'Taskedular',
            description: 'A distributed task executor system supporting cron expressions, retry backoffs, and execution logs tracking.',
            techStack: ['Spring Boot', 'Quartz', 'MySQL', 'React', 'RabbitMQ'],
            githubLink: 'https://github.com/tusquake/Taskedular',
            image: '/projects/taskedular.png',
            featured: false,
        },
        {
            _id: '21',
            title: 'QuickPe',
            description: 'A high-performance peer-to-peer payment gateway simulating transaction processing, ledger balancing, and audit runs.',
            techStack: ['Go', 'Kafka', 'Redis', 'PostgreSQL', 'Docker'],
            githubLink: 'https://github.com/tusquake/QuickPe',
            image: '/projects/quickpe.png',
            featured: true,
        },
        {
            _id: '22',
            title: 'Mobile-Geotkr',
            description: 'Cross-platform mobile application capturing background GPS telemetry logs and syncing them to backend clusters.',
            techStack: ['React Native', 'Expo', 'Google Maps API', 'Node.js'],
            githubLink: 'https://github.com/tusquake/Mobile-Geotkr',
            image: '/projects/mobile_geotkr.png',
            featured: false,
        },
        {
            _id: '23',
            title: 'MFA',
            description: 'A robust multi-factor authentication library implementing TOTP key generators, QR codes, and backup codes management.',
            techStack: ['Spring Security', 'TOTP', 'Redis', 'Thymeleaf', 'PostgreSQL'],
            githubLink: 'https://github.com/tusquake/MFA',
            image: '/projects/mfa.png',
            featured: false,
        },
        {
            _id: '24',
            title: 'HealSync',
            description: 'A patient-doctor collaboration portal offering video consultation scheduling, prescription records, and live chats.',
            techStack: ['React', 'Express', 'MongoDB', 'Socket.io', 'Tailwind'],
            githubLink: 'https://github.com/tusquake/HealSync',
            image: '/projects/healsync.png',
            featured: true,
        },
        {
            _id: '25',
            title: 'Ecom-Mini',
            description: 'A modular e-commerce engine providing catalog search, shopping carts management, checkout pipelines, and order logging.',
            techStack: ['Spring Boot', 'Hibernate', 'PostgreSQL', 'React', 'Docker'],
            githubLink: 'https://github.com/tusquake/Ecom-Mini',
            image: '/projects/ecom_mini.png',
            featured: false,
        },
        {
            _id: '26',
            title: 'Streamify',
            description: 'A self-hosted video streaming service transcoding media assets into HLS segments for adaptive bitrate playback.',
            techStack: ['Node.js', 'FFmpeg', 'HLS', 'React', 'AWS S3'],
            githubLink: 'https://github.com/tusquake/Streamify',
            image: '/projects/streamify.png',
            featured: true,
        },
        {
            _id: '27',
            title: 'AI-Customer-Support',
            description: 'An AI-powered ticketing assistant classifying customer queries and generating context-aware support draft replies.',
            techStack: ['Python', 'Gemini API', 'LangChain', 'FastAPI', 'React'],
            githubLink: 'https://github.com/tusquake/AI-Customer-Support',
            image: '/projects/ai_customer_support.png',
            featured: true,
        },
        {
            _id: '28',
            title: 'Procura',
            description: 'An enterprise procurement tool facilitating vendor onboarding, RFQ submissions, and purchase order tracking.',
            techStack: ['Spring Boot', 'PostgreSQL', 'React', 'Tailwind', 'Docker'],
            githubLink: 'https://github.com/tusquake/Procura',
            image: '/projects/procura.png',
            featured: false,
        },
        {
            _id: '29',
            title: 'Servigo',
            description: 'On-demand local service directory linking consumers with vetted local repair, cleaning, and maintenance specialists.',
            techStack: ['Go', 'WebSockets', 'Redis', 'PostgreSQL', 'React'],
            githubLink: 'https://github.com/tusquake/Servigo',
            image: '/projects/servigo.png',
            featured: false,
        },
        {
            _id: '30',
            title: 'SnapURL',
            description: 'Sleek, lightweight link-shortener application providing geo-location click metrics and QR-code generators.',
            techStack: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Tailwind'],
            githubLink: 'https://github.com/tusquake/SnapURL',
            image: '/projects/snapurl.png',
            featured: false,
        },
        {
            _id: '31',
            title: 'Banking-System',
            description: 'Core banking ledger simulator managing accounts creation, balance updates, funds transfers, and statements.',
            techStack: ['Java', 'Spring Boot', 'JPA', 'MySQL', 'Thymeleaf'],
            githubLink: 'https://github.com/tusquake/Banking-System',
            image: '/projects/banking_system.png',
            featured: false,
        },
        {
            _id: '32',
            title: 'Coffee-Shop',
            description: 'A static landing page for a gourmet coffee cafe showcasing menu cards, booking sheets, and interactive reviews.',
            techStack: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
            githubLink: 'https://github.com/tusquake/Coffee-Shop',
            image: '/projects/coffee_shop.png',
            featured: false,
        },
        {
            _id: '33',
            title: 'Stock-Trading-Platform',
            description: 'Real-time stock portfolio tracker visualizing price tickers, order execution simulation, and history metrics.',
            techStack: ['Go', 'WebSockets', 'Redis', 'React', 'TimescaleDB'],
            githubLink: 'https://github.com/tusquake/Stock-Trading-Platform',
            image: '/projects/stock_trading.png',
            featured: true,
        },
        {
            _id: '34',
            title: 'Nginx',
            description: 'A library of custom NGINX configuration templates optimized for reverse proxy, SSL termination, and rate limiting.',
            techStack: ['Bash', 'NGINX Config', 'SSL/TLS', 'Docker'],
            githubLink: 'https://github.com/tusquake/Nginx',
            image: '/projects/nginx.png',
            featured: false,
        },
        {
            _id: '35',
            title: 'Customer-Order-Management-Dashboard',
            description: 'An analytical panel compiling sales metrics, customer orders fulfillment status, and order revenue breakdowns.',
            techStack: ['React', 'Node.js', 'MongoDB', 'Chart.js', 'Tailwind'],
            githubLink: 'https://github.com/tusquake/Customer-Order-Management-Dashboard',
            image: '/projects/order_dashboard.png',
            featured: false,
        },
        {
            _id: '36',
            title: 'AI-Research-Assistant',
            description: 'An intelligent research canvas using RAG to extract semantic summaries and key citations from uploaded PDF papers.',
            techStack: ['Python', 'Gemini API', 'ChromaDB', 'FastAPI', 'React'],
            githubLink: 'https://github.com/tusquake/AI-Research-Assistant',
            image: '/projects/ai_research_assistant.png',
            featured: true,
        },
        {
            _id: '37',
            title: 'ServiCart',
            description: 'Mobile grocery checkout assistant supporting item cataloging, real-time total updates, and local store locator.',
            techStack: ['React Native', 'Node.js', 'MongoDB', 'Redux Toolkit'],
            githubLink: 'https://github.com/tusquake/ServiCart',
            image: '/projects/servicart.png',
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
                            {/* Project image */}
                            <div className="h-48 relative overflow-hidden">
                                {project.image ? (
                                    <>
                                        <img
                                            src={getImageUrl(project.image)}
                                            alt={project.title}
                                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                        />
                                        {project.featured && (
                                            <span className="absolute top-4 right-4 px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full z-10 shadow-md">
                                                Featured
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    <ProjectCover project={project} />
                                )}
                                <div className="absolute inset-0 bg-dark-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
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
