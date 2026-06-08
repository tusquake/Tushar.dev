require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');

const sampleProjects = [
    {
        title: 'HomeGenie - Smart Maintenance Management System',
        description: 'An AI-powered maintenance platform with an integrated Voice Assistant. Architected with separate User, Maintenance, and Voice AI microservices. Integrates FastAPI, Gemini 2.0 Flash, Hugging Face, and Google Speech Recognition for real-time intent detection, speech processing, and automated issue classification. Deployed on AWS Elastic Beanstalk.',
        techStack: ['Spring Boot', 'Microservices', 'React', 'Tailwind CSS', 'FastAPI', 'PostgreSQL', 'AWS S3', 'Gemini API'],
        githubLink: 'https://github.com/tusquake/HomeGenie',
        liveDemo: 'https://homegenie-ucu3.onrender.com/',
        image: '/projects/homegenie.png',
        featured: true,
        order: 1
    },
    {
        title: 'SpendWise - AI-Powered Expense Tracker',
        description: 'An AI-powered expense tracker featuring automatic categorization using the Gemini API. Implements OAuth 2.0 security, rate limiting, circuit breaker pattern with fallbacks, and in-memory caching to achieve 40% faster response times.',
        techStack: ['Spring Boot', 'OAuth 2.0', 'Spring Security', 'React', 'PostgreSQL', 'Tailwind CSS', 'Gemini API'],
        githubLink: 'https://github.com/tusquake/SpendWise',
        liveDemo: 'https://spendwise-1-bcdd.onrender.com/',
        image: '/projects/spendwise.png',
        featured: true,
        order: 2
    },
    {
        title: 'SocialGraph Recommendation & Fraud Engine',
        description: 'High-throughput social network analysis platform that evaluates relationships, identifies real-time community rings, detects anomalous connection patterns for fraud prevention, and generates personalized connection recommendations using graph theory.',
        techStack: ['Neo4j', 'Python', 'FastAPI', 'Redis', 'Docker', 'GraphQL'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/SocialGraph-Recommendation-Engine',
        image: '/projects/socialgraph.png',
        featured: true,
        order: 3
    },
    {
        title: 'Global Distributed Rate Limiter',
        description: 'A highly scalable, multi-region distributed rate limiting system implementing Token Bucket and Sliding Window algorithms. Features low-latency synchronization across edge nodes and seamless failover resilience.',
        techStack: ['Go', 'Redis', 'gRPC', 'Envoy', 'Docker', 'Prometheus'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Global-Rate-Limiter',
        image: '/projects/ratelimiter.png',
        featured: true,
        order: 4
    },
    {
        title: 'Advanced Search & Intelligence Engine',
        description: 'An intelligent search platform featuring full-text indexation, semantic search using vector embeddings, custom relevance scoring models, real-time analytics, and instant typo tolerance.',
        techStack: ['Elasticsearch', 'Python', 'Logstash', 'Kibana', 'FastAPI', 'Redis'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Advanced-Search-Engine',
        image: '/projects/search_engine.png',
        featured: true,
        order: 5
    },
    {
        title: 'Distributed Notification Service',
        description: 'A high-performance alert delivery system supporting push notifications, SMS, and email channels. Leverages partition key distribution, consumer groups, dead letter queues, and caching for sub-second delivery under peak load.',
        techStack: ['Spring Boot', 'Apache Kafka', 'Redis', 'WebSockets', 'Firebase', 'PostgreSQL'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Distributed-Notification-Service',
        image: '/projects/notification_service.png',
        featured: true,
        order: 6
    },
    {
        title: 'Distributed Ledger & Atomic Transfers',
        description: 'An immutable double-entry distributed ledger system with support for multi-party atomic transfers. Implements strict serializable transaction isolation, transaction signing, and complete audit trail logging.',
        techStack: ['Node.js', 'Redis', 'PostgreSQL', 'Docker', 'TypeScript'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Distributed-Ledger-System',
        image: '/projects/ledger.png',
        featured: true,
        order: 7
    },
    {
        title: 'High-Performance URL Shortener',
        description: 'A ultra-fast URL redirection service generating unique, short, human-readable tags using Base62 encoding. Utilizes bloom filters and caching strategies to minimize database lookup latencies.',
        techStack: ['Go', 'Redis', 'PostgreSQL', 'NGINX', 'Docker', 'Base62'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/url-shortener-system',
        image: '/projects/url_shortener.png',
        featured: false,
        order: 8
    },
    {
        title: 'GCS Signed URL & Media Delivery',
        description: 'Secure and optimized asset delivery pipeline utilizing Google Cloud Storage Signed URLs. Enforces time-bound asset authorization, automated cache expiration headers, and image resizing transformations.',
        techStack: ['Node.js', 'Google Cloud Storage', 'CDN', 'Express', 'React'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/gcs-signed-url-system',
        image: '/projects/gcs_media.png',
        featured: false,
        order: 9
    },
    {
        title: 'Ride-Sharing Geospatial Engine',
        description: 'High-frequency geospatial location tracking and matchmaker system for ride dispatching. Computes active driver densities using H3 spatial indexing and matches riders dynamically using cost distance metrics.',
        techStack: ['Go', 'Redis GEO', 'PostGIS', 'Kafka', 'WebSockets', 'React'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Ride-Sharing-Geospatial-System',
        image: '/projects/ride_sharing.png',
        featured: true,
        order: 10
    },
    {
        title: 'IoT Telemetry & Analytics Platform',
        description: 'A robust time-series ingestion and analytics platform designed to collect, process, and display telemetry logs from millions of IoT devices. Supports streaming aggregations and anomaly alerts.',
        techStack: ['Cassandra', 'Python', 'RabbitMQ', 'Grafana', 'InfluxDB', 'Docker'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/IoT-GCP-Cassandra-Telemetry',
        image: '/projects/iot_telemetry.png',
        featured: false,
        order: 11
    },
    {
        title: 'Collaborative Document Editor',
        description: 'A real-time collaborative text editor supporting simultaneous document modifications. Employs Conflict-free Replicated Data Types (CRDTs) to resolve update synchronization without server-side locking.',
        techStack: ['Node.js', 'Socket.io', 'Redis', 'Yjs', 'React'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Collaborative-Doc-Editor',
        image: '/projects/collab_editor.png',
        featured: true,
        order: 12
    },
    {
        title: 'Real-Time Traffic Simulation & Monitoring Platform',
        description: 'Visual urban traffic modeling platform simulating vehicle agents moving along road networks. Renders live heatmaps of congestion points and calculates optimal routing dynamically using A* search.',
        techStack: ['Python', 'React', 'Leaflet', 'WebSockets', 'FastAPI', 'Kafka'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Real-Time-Traffic-Sim-Map',
        image: '/projects/traffic_simulation.png',
        featured: false,
        order: 13
    },
    {
        title: 'Vortex Gaming Platform',
        description: 'A modern game distribution dashboard displaying storefronts, community feeds, online player indicators, achievement badges, and live match lobbies.',
        techStack: ['Spring Boot', 'GraphQL', 'PostgreSQL', 'Redis', 'React', 'Docker'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/Vortex-Gaming-Platform',
        image: '/projects/vortex_gaming.png',
        featured: true,
        order: 14
    },
    {
        title: 'AI Collaboration Platform',
        description: 'Interactive collaborative canvas allowing teams to generate mindmaps, system architectures, and documentation notes synced live with an autonomous AI co-pilot agent.',
        techStack: ['React', 'Node.js', 'Gemini API', 'MongoDB', 'WebSockets', 'Tailwind'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/ai-collaboration-platform',
        image: '/projects/ai_collaboration.png',
        featured: true,
        order: 15
    },
    {
        title: 'CricStream: Real-Time Cricket Scoreboard',
        description: 'Ultra-low latency cricket matches tracker streaming ball-by-ball score updates, team tables, and live run charts to thousands of users simultaneously using Server-Sent Events.',
        techStack: ['React', 'Go', 'Redis Pub/Sub', 'SSE', 'PostgreSQL', 'Docker'],
        githubLink: 'https://github.com/tusquake/System-Design-Practical-Projects/tree/main/cricstream',
        image: '/projects/cricstream.png',
        featured: true,
        order: 16
    },
    {
        title: 'GeoTrakr',
        description: 'Real-time geo-tracking platform showcasing driver fleets, route histories, and geofencing triggers via microservices.',
        techStack: ['Go', 'Redis', 'PostgreSQL', 'WebSockets', 'Leaflet'],
        githubLink: 'https://github.com/tusquake/GeoTrakr',
        image: '/projects/geotrakr.png',
        featured: true,
        order: 17
    },
    {
        title: 'Production Sequencing Manager',
        description: 'An enterprise-grade production scheduler utilizing sorting rules (EDD, SPT, LPT) and order prioritization pipelines.',
        techStack: ['React', 'Spring Boot', 'PostgreSQL', 'Kafka', 'Tailwind CSS'],
        githubLink: 'https://github.com/tusquake/Production-Sequencing-Manager',
        image: '',
        featured: true,
        order: 18
    },
    {
        title: 'env-validator',
        description: 'Lightweight configuration verification module checking schema correctness, default fallbacks, and missing production variables.',
        techStack: ['TypeScript', 'Node.js', 'npm', 'Jest', 'CI/CD'],
        githubLink: 'https://github.com/tusquake/env-validator',
        image: '',
        featured: false,
        order: 19
    },
    {
        title: 'Taskedular',
        description: 'A distributed task executor system supporting cron expressions, retry backoffs, and execution logs tracking.',
        techStack: ['Spring Boot', 'Quartz', 'MySQL', 'React', 'RabbitMQ'],
        githubLink: 'https://github.com/tusquake/Taskedular',
        image: '',
        featured: false,
        order: 20
    },
    {
        title: 'QuickPe',
        description: 'A high-performance peer-to-peer payment gateway simulating transaction processing, ledger balancing, and audit runs.',
        techStack: ['Go', 'Kafka', 'Redis', 'PostgreSQL', 'Docker'],
        githubLink: 'https://github.com/tusquake/QuickPe',
        image: '',
        featured: true,
        order: 21
    },
    {
        title: 'Mobile-Geotkr',
        description: 'Cross-platform mobile application capturing background GPS telemetry logs and syncing them to backend clusters.',
        techStack: ['React Native', 'Expo', 'Google Maps API', 'Node.js'],
        githubLink: 'https://github.com/tusquake/Mobile-Geotkr',
        image: '',
        featured: false,
        order: 22
    },
    {
        title: 'MFA',
        description: 'A robust multi-factor authentication library implementing TOTP key generators, QR codes, and backup codes management.',
        techStack: ['Spring Security', 'TOTP', 'Redis', 'Thymeleaf', 'PostgreSQL'],
        githubLink: 'https://github.com/tusquake/MFA',
        image: '',
        featured: false,
        order: 23
    },
    {
        title: 'HealSync',
        description: 'A patient-doctor collaboration portal offering video consultation scheduling, prescription records, and live chats.',
        techStack: ['React', 'Express', 'MongoDB', 'Socket.io', 'Tailwind'],
        githubLink: 'https://github.com/tusquake/HealSync',
        image: '',
        featured: true,
        order: 24
    },
    {
        title: 'Ecom-Mini',
        description: 'A modular e-commerce engine providing catalog search, shopping carts management, checkout pipelines, and order logging.',
        techStack: ['Spring Boot', 'Hibernate', 'PostgreSQL', 'React', 'Docker'],
        githubLink: 'https://github.com/tusquake/Ecom-Mini',
        image: '',
        featured: false,
        order: 25
    },
    {
        title: 'Streamify',
        description: 'A self-hosted video streaming service transcoding media assets into HLS segments for adaptive bitrate playback.',
        techStack: ['Node.js', 'FFmpeg', 'HLS', 'React', 'AWS S3'],
        githubLink: 'https://github.com/tusquake/Streamify',
        image: '',
        featured: true,
        order: 26
    },
    {
        title: 'AI-Customer-Support',
        description: 'An AI-powered ticketing assistant classifying customer queries and generating context-aware support draft replies.',
        techStack: ['Python', 'Gemini API', 'LangChain', 'FastAPI', 'React'],
        githubLink: 'https://github.com/tusquake/AI-Customer-Support',
        image: '',
        featured: true,
        order: 27
    },
    {
        title: 'Procura',
        description: 'An enterprise procurement tool facilitating vendor onboarding, RFQ submissions, and purchase order tracking.',
        techStack: ['Spring Boot', 'PostgreSQL', 'React', 'Tailwind', 'Docker'],
        githubLink: 'https://github.com/tusquake/Procura',
        image: '',
        featured: false,
        order: 28
    },
    {
        title: 'Servigo',
        description: 'On-demand local service directory linking consumers with vetted local repair, cleaning, and maintenance specialists.',
        techStack: ['Go', 'WebSockets', 'Redis', 'PostgreSQL', 'React'],
        githubLink: 'https://github.com/tusquake/Servigo',
        image: '',
        featured: false,
        order: 29
    },
    {
        title: 'SnapURL',
        description: 'Sleek, lightweight link-shortener application providing geo-location click metrics and QR-code generators.',
        techStack: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Tailwind'],
        githubLink: 'https://github.com/tusquake/SnapURL',
        image: '',
        featured: false,
        order: 30
    },
    {
        title: 'Banking-System',
        description: 'Core banking ledger simulator managing accounts creation, balance updates, funds transfers, and statements.',
        techStack: ['Java', 'Spring Boot', 'JPA', 'MySQL', 'Thymeleaf'],
        githubLink: 'https://github.com/tusquake/Banking-System',
        image: '',
        featured: false,
        order: 31
    },
    {
        title: 'Coffee-Shop',
        description: 'A static landing page for a gourmet coffee cafe showcasing menu cards, booking sheets, and interactive reviews.',
        techStack: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
        githubLink: 'https://github.com/tusquake/Coffee-Shop',
        image: '',
        featured: false,
        order: 32
    },
    {
        title: 'Stock-Trading-Platform',
        description: 'Real-time stock portfolio tracker visualizing price tickers, order execution simulation, and history metrics.',
        techStack: ['Go', 'WebSockets', 'Redis', 'React', 'TimescaleDB'],
        githubLink: 'https://github.com/tusquake/Stock-Trading-Platform',
        image: '',
        featured: true,
        order: 33
    },
    {
        title: 'Nginx',
        description: 'A library of custom NGINX configuration templates optimized for reverse proxy, SSL termination, and rate limiting.',
        techStack: ['Bash', 'NGINX Config', 'SSL/TLS', 'Docker'],
        githubLink: 'https://github.com/tusquake/Nginx',
        image: '',
        featured: false,
        order: 34
    },
    {
        title: 'Customer-Order-Management-Dashboard',
        description: 'An analytical panel compiling sales metrics, customer orders fulfillment status, and order revenue breakdowns.',
        techStack: ['React', 'Node.js', 'MongoDB', 'Chart.js', 'Tailwind'],
        githubLink: 'https://github.com/tusquake/Customer-Order-Management-Dashboard',
        image: '',
        featured: false,
        order: 35
    },
    {
        title: 'AI-Research-Assistant',
        description: 'An intelligent research canvas using RAG to extract semantic summaries and key citations from uploaded PDF papers.',
        techStack: ['Python', 'Gemini API', 'ChromaDB', 'FastAPI', 'React'],
        githubLink: 'https://github.com/tusquake/AI-Research-Assistant',
        image: '',
        featured: true,
        order: 36
    },
    {
        title: 'ServiCart',
        description: 'Mobile grocery checkout assistant supporting item cataloging, real-time total updates, and local store locator.',
        techStack: ['React Native', 'Node.js', 'MongoDB', 'Redux Toolkit'],
        githubLink: 'https://github.com/tusquake/ServiCart',
        image: '',
        featured: false,
        order: 37
    }
];

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        console.log('Clearing projects collection...');
        await Project.deleteMany({});
        console.log('Projects collection cleared.');

        console.log('Inserting seed projects...');
        const result = await Project.insertMany(sampleProjects);
        console.log(`Successfully seeded ${result.length} projects.`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
