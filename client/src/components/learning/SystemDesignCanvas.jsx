import { useState, useRef, useEffect } from 'react';
import Card from '../common/Card';

// Component Icon Mappings for the Toolbox
const COMPONENT_TYPES = {
    client: {
        label: 'Client App',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        color: 'from-blue-500 to-cyan-500',
        defaultLabel: 'Web/Mobile Client',
    },
    dns: {
        label: 'DNS / Route 53',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
        ),
        color: 'from-indigo-500 to-purple-500',
        defaultLabel: 'Route 53 DNS',
    },
    cdn: {
        label: 'CDN (Cloudflare)',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
        ),
        color: 'from-amber-500 to-orange-500',
        defaultLabel: 'CDN Cache',
    },
    lb: {
        label: 'Load Balancer',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
        color: 'from-emerald-500 to-teal-500',
        defaultLabel: 'Nginx LB',
    },
    gateway: {
        label: 'API Gateway',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        color: 'from-teal-500 to-cyan-500',
        defaultLabel: 'Kong Gateway',
    },
    server: {
        label: 'App Server',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
        ),
        color: 'from-violet-500 to-purple-500',
        defaultLabel: 'Microservice',
    },
    cache: {
        label: 'Cache (Redis)',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
        ),
        color: 'from-rose-500 to-pink-500',
        defaultLabel: 'Redis Cluster',
    },
    db: {
        label: 'Database',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
        ),
        color: 'from-blue-600 to-indigo-600',
        defaultLabel: 'PostgreSQL DB',
    },
    queue: {
        label: 'Message Queue',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v2" />
            </svg>
        ),
        color: 'from-fuchsia-500 to-rose-500',
        defaultLabel: 'Kafka Topic',
    },
    storage: {
        label: 'Cloud Storage',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        ),
        color: 'from-sky-400 to-blue-500',
        defaultLabel: 'S3 Bucket',
    },
    text: {
        label: 'Annotation',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
        ),
        color: 'from-dark-400 to-dark-600 dark:from-dark-500 dark:to-dark-400',
        defaultLabel: 'Double click to edit note',
    }
};

// Architecture Templates
const TEMPLATES = {
    urlShortener: {
        title: 'URL Shortener System',
        description: 'Highly available URL shortening architecture with CDN and Redis Cache layer.',
        nodes: [
            { id: 'n1', type: 'client', x: 80, y: 220, label: 'Client / App', color: 'from-blue-500 to-cyan-500', description: 'Web client requests shortened URLs.' },
            { id: 'n2', type: 'dns', x: 250, y: 100, label: 'DNS Route 53', color: 'from-indigo-500 to-purple-500', description: 'Resolves domains with latency routing.' },
            { id: 'n3', type: 'cdn', x: 250, y: 220, label: 'Cloudflare CDN', color: 'from-amber-500 to-orange-500', description: 'Caches redirect targets for top URL lookups.' },
            { id: 'n4', type: 'lb', x: 420, y: 220, label: 'Load Balancer', color: 'from-emerald-500 to-teal-500', description: 'Nginx round-robin routing.' },
            { id: 'n5', type: 'server', x: 590, y: 150, label: 'Write Server', color: 'from-violet-500 to-purple-500', description: 'Handles hash creation and DB writes.' },
            { id: 'n6', type: 'server', x: 590, y: 290, label: 'Read Server', color: 'from-violet-500 to-purple-500', description: 'Handles direct 302 redirect lookups.' },
            { id: 'n7', type: 'cache', x: 760, y: 290, label: 'Redis Cache', color: 'from-rose-500 to-pink-500', description: 'Caches mapping: ShortURL -> LongURL.' },
            { id: 'n8', type: 'db', x: 760, y: 150, label: 'SQL DB (Master)', color: 'from-blue-600 to-indigo-600', description: 'Relational database for storing original mapping.' },
        ],
        connections: [
            { id: 'c1', from: 'n1', to: 'n2', label: '1. Resolve Domain' },
            { id: 'c2', from: 'n1', to: 'n3', label: '2. Request short URL' },
            { id: 'c3', from: 'n3', to: 'n4', label: '3. Cache Miss' },
            { id: 'c4', from: 'n4', to: 'n5', label: 'POST /create' },
            { id: 'c5', from: 'n4', to: 'n6', label: 'GET /:hash' },
            { id: 'c6', from: 'n5', to: 'n8', label: 'Insert hash' },
            { id: 'c7', from: 'n6', to: 'n7', label: 'Cache Lookup' },
            { id: 'c8', from: 'n7', to: 'n8', label: 'DB Fallback' },
        ]
    },
    rateLimiter: {
        title: 'Distributed Rate Limiter',
        description: 'Token Bucket rate limiter using API gateway and centralized Redis sliding window counters.',
        nodes: [
            { id: 'n1', type: 'client', x: 90, y: 200, label: 'Traffic Client', color: 'from-blue-500 to-cyan-500', description: 'Initiates high throughput REST/HTTP calls.' },
            { id: 'n2', type: 'gateway', x: 300, y: 200, label: 'Kong API Gateway', color: 'from-teal-500 to-cyan-500', description: 'Inspects IP and Auth tokens for limits.' },
            { id: 'n3', type: 'cache', x: 510, y: 100, label: 'Redis Cluster', color: 'from-rose-500 to-pink-500', description: 'Atomic sliding window / Token bucket execution.' },
            { id: 'n4', type: 'server', x: 510, y: 300, label: 'Core App Engine', color: 'from-violet-500 to-purple-500', description: 'Downstream microservice executing business logic.' },
            { id: 'n5', type: 'queue', x: 720, y: 200, label: 'Dead Letter Queue', color: 'from-fuchsia-500 to-rose-500', description: 'Queues rate-limited client requests for retry.' }
        ],
        connections: [
            { id: 'c1', from: 'n1', to: 'n2', label: 'HTTPS Request' },
            { id: 'c2', from: 'n2', to: 'n3', label: 'Fetch token status' },
            { id: 'c3', from: 'n2', to: 'n4', label: '200 OK Route' },
            { id: 'c4', from: 'n2', to: 'n5', label: '429 Rate Limited' }
        ]
    },
    messageQueue: {
        title: 'Async Pub/Sub System',
        description: 'Decoupled worker architecture with consumer groups and durable message queues.',
        nodes: [
            { id: 'n1', type: 'client', x: 100, y: 150, label: 'Publisher Service', color: 'from-blue-500 to-cyan-500', description: 'Emits state changes or log events.' },
            { id: 'n2', type: 'queue', x: 350, y: 150, label: 'Kafka Broker', color: 'from-fuchsia-500 to-rose-500', description: 'Persists events across partitions.' },
            { id: 'n3', type: 'server', x: 600, y: 90, label: 'Email Worker', color: 'from-violet-500 to-purple-500', description: 'Sends verification emails.' },
            { id: 'n4', type: 'server', x: 600, y: 210, label: 'Analytics Engine', color: 'from-violet-500 to-purple-500', description: 'Aggregates statistics.' },
            { id: 'n5', type: 'db', x: 800, y: 210, label: 'NoSQL Analytics DB', color: 'from-blue-600 to-indigo-600', description: 'Column-oriented time-series storage.' }
        ],
        connections: [
            { id: 'c1', from: 'n1', to: 'n2', label: 'Publish to topic' },
            { id: 'c2', from: 'n2', to: 'n3', label: 'Consume Group A' },
            { id: 'c3', from: 'n2', to: 'n4', label: 'Consume Group B' },
            { id: 'c4', from: 'n4', to: 'n5', label: 'Batch Write' }
        ]
    }
};

const SystemDesignCanvas = () => {
    const [nodes, setNodes] = useState(() => {
        const cached = localStorage.getItem('codeforge_canvas_nodes');
        return cached ? JSON.parse(cached) : TEMPLATES.urlShortener.nodes;
    });

    const [connections, setConnections] = useState(() => {
        const cached = localStorage.getItem('codeforge_canvas_connections');
        return cached ? JSON.parse(cached) : TEMPLATES.urlShortener.connections;
    });

    // Editor tool mode: 'select' (drag & view), 'connect' (link components)
    const [toolMode, setToolMode] = useState('select');
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);

    // Temp state for connection drawing
    const [connectionSource, setConnectionSource] = useState(null);

    // Grid details
    const gridSize = 20;
    const canvasRef = useRef(null);
    const draggingNodeRef = useRef(null);
    const dragOffsetRef = useRef({ x: 0, y: 0 });

    // Node details form state
    const [nodeForm, setNodeForm] = useState({ label: '', description: '' });
    const [connectionForm, setConnectionForm] = useState({ label: '' });

    // Sync state changes to localstorage
    useEffect(() => {
        localStorage.setItem('codeforge_canvas_nodes', JSON.stringify(nodes));
    }, [nodes]);

    useEffect(() => {
        localStorage.setItem('codeforge_canvas_connections', JSON.stringify(connections));
    }, [connections]);

    // Update node details form when selected node changes
    useEffect(() => {
        if (selectedNodeId) {
            const node = nodes.find(n => n.id === selectedNodeId);
            if (node) {
                setNodeForm({
                    label: node.label,
                    description: node.description || ''
                });
            }
            setSelectedConnectionId(null);
        } else {
            setNodeForm({ label: '', description: '' });
        }
    }, [selectedNodeId, nodes]);

    // Update connection form when selected connection changes
    useEffect(() => {
        if (selectedConnectionId) {
            const conn = connections.find(c => c.id === selectedConnectionId);
            if (conn) {
                setConnectionForm({ label: conn.label || '' });
            }
            setSelectedNodeId(null);
        } else {
            setConnectionForm({ label: '' });
        }
    }, [selectedConnectionId, connections]);

    // Add component node to canvas
    const handleAddComponent = (type) => {
        const defaults = COMPONENT_TYPES[type];
        if (!defaults) return;

        // Position nodes relative to current center scroll
        const newId = `node_${Date.now()}`;
        const newNode = {
            id: newId,
            type,
            x: 200 + Math.random() * 80,
            y: 150 + Math.random() * 80,
            label: defaults.defaultLabel,
            color: defaults.color,
            description: `A distributed ${defaults.label} component.`
        };

        setNodes(prev => [...prev, newNode]);
        setSelectedNodeId(newId);
        setToolMode('select');
    };

    // Node selection / Drag Start
    const handleNodeMouseDown = (e, nodeId) => {
        if (toolMode === 'connect') {
            if (!connectionSource) {
                setConnectionSource(nodeId);
            } else if (connectionSource !== nodeId) {
                // Check if connection already exists
                const exists = connections.some(c =>
                    (c.from === connectionSource && c.to === nodeId)
                );
                if (!exists) {
                    const newConn = {
                        id: `conn_${Date.now()}`,
                        from: connectionSource,
                        to: nodeId,
                        label: 'Data Sync'
                    };
                    setConnections(prev => [...prev, newConn]);
                }
                setConnectionSource(null);
                setToolMode('select');
            }
            return;
        }

        e.stopPropagation();
        setSelectedNodeId(nodeId);
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        draggingNodeRef.current = nodeId;
        // Calculate offset so node doesn't jump to cursor pointer
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        dragOffsetRef.current = {
            x: clientX - node.x,
            y: clientY - node.y
        };
    };

    // Global drag mouse movements
    const handleCanvasMouseMove = (e) => {
        if (!draggingNodeRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;

        // Calculate raw coords
        let targetX = clientX - dragOffsetRef.current.x;
        let targetY = clientY - dragOffsetRef.current.y;

        // Grid snap alignment (dampen movement to grid points)
        targetX = Math.round(targetX / gridSize) * gridSize;
        targetY = Math.round(targetY / gridSize) * gridSize;

        // Keep inside canvas bounds
        targetX = Math.max(20, Math.min(targetX, rect.width - 150));
        targetY = Math.max(20, Math.min(targetY, rect.height - 80));

        setNodes(prev => prev.map(n =>
            n.id === draggingNodeRef.current
                ? { ...n, x: targetX, y: targetY }
                : n
        ));
    };

    // Stop dragging
    const handleCanvasMouseUp = () => {
        draggingNodeRef.current = null;
    };

    // Clear selected items
    const handleCanvasClick = (e) => {
        if (e.target === canvasRef.current || e.target.tagName === 'svg') {
            setSelectedNodeId(null);
            setSelectedConnectionId(null);
            setConnectionSource(null);
        }
    };

    // Save Node Settings
    const handleSaveNodeDetails = (e) => {
        e.preventDefault();
        setNodes(prev => prev.map(n =>
            n.id === selectedNodeId
                ? { ...n, label: nodeForm.label, description: nodeForm.description }
                : n
        ));
    };

    // Save Connection Settings
    const handleSaveConnectionDetails = (e) => {
        e.preventDefault();
        setConnections(prev => prev.map(c =>
            c.id === selectedConnectionId
                ? { ...c, label: connectionForm.label }
                : c
        ));
    };

    // Delete node
    const handleDeleteNode = (nodeId) => {
        setNodes(prev => prev.filter(n => n.id !== nodeId));
        // Cascade delete connections tied to node
        setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
        if (selectedNodeId === nodeId) setSelectedNodeId(null);
    };

    // Delete connection
    const handleDeleteConnection = (connId) => {
        setConnections(prev => prev.filter(c => c.id !== connId));
        if (selectedConnectionId === connId) setSelectedConnectionId(null);
    };

    // Clear whole canvas
    const handleClearCanvas = () => {
        setNodes([]);
        setConnections([]);
        setSelectedNodeId(null);
        setSelectedConnectionId(null);
        setConnectionSource(null);
    };

    // Load template
    const handleLoadTemplate = (templateKey) => {
        const temp = TEMPLATES[templateKey];
        if (temp) {
            setNodes(temp.nodes);
            setConnections(temp.connections);
            setSelectedNodeId(null);
            setSelectedConnectionId(null);
            setConnectionSource(null);
        }
    };

    // Helper functions to get arrow endpoint offsets
    const getNodeCenter = (nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return { x: 0, y: 0 };
        return {
            x: node.x + 80, // half width of component node (160px)
            y: node.y + 35  // half height of component node (70px)
        };
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 animate-tab-switch pb-4 w-full">
            {/* Left Column: Toolbox and Templates */}
            <div className="w-full lg:w-72 flex flex-col gap-4 flex-shrink-0">
                {/* 1. Component Templates */}
                <Card className="p-4">
                    <h3 className="text-xs font-bold text-dark-900 dark:text-white uppercase tracking-wider mb-3">
                        Preset Systems
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(TEMPLATES).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => handleLoadTemplate(key)}
                                className="w-full text-left p-2.5 rounded-xl border border-dark-200 dark:border-dark-800 hover:border-primary-500/40 bg-white dark:bg-dark-900/60 hover:bg-dark-50 dark:hover:bg-dark-950/30 transition-all flex flex-col cursor-pointer"
                            >
                                <span className="text-xs font-bold text-dark-900 dark:text-white">{value.title}</span>
                                <span className="text-[10px] text-dark-500 dark:text-dark-400 mt-0.5 line-clamp-2">
                                    {value.description}
                                </span>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* 2. Drag/Click Components Tool Box */}
                <Card className="p-4">
                    <h3 className="text-xs font-bold text-dark-900 dark:text-white uppercase tracking-wider mb-3">
                        System Elements
                    </h3>
                    <p className="text-[10px] text-dark-500 dark:text-dark-400 mb-3">
                        Click elements below to drop them onto the canvas workspace.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(COMPONENT_TYPES).map(([type, value]) => (
                            <button
                                key={type}
                                onClick={() => handleAddComponent(type)}
                                className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-dark-800 dark:text-dark-300 hover:text-primary-500 dark:hover:text-primary-450 hover:bg-dark-50 dark:hover:bg-dark-950/40 transition-all cursor-pointer text-center"
                            >
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${value.color} text-white`}>
                                    {value.icon}
                                </div>
                                <span className="text-[10px] font-bold tracking-tight">{value.label}</span>
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Middle Column: The Canvas Playground */}
            <div className="flex-grow flex flex-col min-w-0">
                <Card className="p-4 flex flex-col h-[70vh] min-h-[550px] shadow-sm border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 overflow-hidden relative select-none">
                    {/* Canvas Controls Toolbar */}
                    <div className="flex items-center justify-between border-b border-dark-200 dark:border-dark-800 pb-3 mb-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            {/* Selector Tool */}
                            <button
                                onClick={() => {
                                    setToolMode('select');
                                    setConnectionSource(null);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${toolMode === 'select'
                                    ? 'bg-primary-500 text-white shadow-sm'
                                    : 'border border-dark-200 dark:border-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-950/50'
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                                </svg>
                                Pointer Tool
                            </button>

                            {/* Connection Linker Tool */}
                            <button
                                onClick={() => {
                                    setToolMode('connect');
                                    setSelectedNodeId(null);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${toolMode === 'connect'
                                    ? 'bg-amber-500 text-white shadow-sm'
                                    : 'border border-dark-200 dark:border-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-50 dark:hover:bg-dark-950/50'
                                    }`}
                                title="Click on Node A, then Node B to establish flow paths"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Flow Linker
                            </button>
                        </div>

                        {/* Status bar description / instructions */}
                        <span className="hidden md:inline text-[11px] text-dark-500 dark:text-dark-400 italic font-medium">
                            {toolMode === 'connect'
                                ? (connectionSource
                                    ? 'Select target node to finish flow link...'
                                    : 'Select source node to draw data path...')
                                : 'Drag nodes to reposition. Click path line to name data type.'}
                        </span>

                        {/* Canvas Clear tool */}
                        <button
                            onClick={handleClearCanvas}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/10 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Clear Canvas
                        </button>
                    </div>

                    {/* Infinite Grid Workspace container */}
                    <div
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                        className="flex-grow rounded-2xl bg-dark-50 dark:bg-dark-950/40 border border-dark-100 dark:border-dark-900 relative overflow-hidden cursor-crosshair"
                        style={{
                            backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                            backgroundSize: `${gridSize}px ${gridSize}px`
                        }}
                    >
                        {/* SVGs rendering the Flow Links / Arrows */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <defs>
                                <marker
                                    id="arrowhead"
                                    viewBox="0 0 10 10"
                                    refX="6"
                                    refY="5"
                                    markerWidth="6"
                                    markerHeight="6"
                                    orient="auto-start-reverse"
                                >
                                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#6366f1" />
                                </marker>
                                <marker
                                    id="arrowhead-active"
                                    viewBox="0 0 10 10"
                                    refX="6"
                                    refY="5"
                                    markerWidth="7"
                                    markerHeight="7"
                                    orient="auto-start-reverse"
                                >
                                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
                                </marker>
                            </defs>

                            {connections.map((conn) => {
                                const fromCenter = getNodeCenter(conn.from);
                                const toCenter = getNodeCenter(conn.to);
                                const isActive = selectedConnectionId === conn.id;

                                // Simple direct line connection with offset bounds
                                return (
                                    <g key={conn.id} className="pointer-events-auto cursor-pointer">
                                        <line
                                            x1={fromCenter.x}
                                            y1={fromCenter.y}
                                            x2={toCenter.x}
                                            y2={toCenter.y}
                                            stroke={isActive ? '#f59e0b' : '#6366f1'}
                                            strokeWidth={isActive ? 3 : 2}
                                            strokeDasharray={conn.label?.toLowerCase().includes('async') ? '5,5' : '0'}
                                            markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                                            className="transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedConnectionId(conn.id);
                                            }}
                                        />
                                        {/* Hover helper for thicker hit targets */}
                                        <line
                                            x1={fromCenter.x}
                                            y1={fromCenter.y}
                                            x2={toCenter.x}
                                            y2={toCenter.y}
                                            stroke="transparent"
                                            strokeWidth={15}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedConnectionId(conn.id);
                                            }}
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Interactive flow connection names/labels in the middle of arrows */}
                        {connections.map((conn) => {
                            const fromCenter = getNodeCenter(conn.from);
                            const toCenter = getNodeCenter(conn.to);
                            const midX = (fromCenter.x + toCenter.x) / 2;
                            const midY = (fromCenter.y + toCenter.y) / 2;

                            return (
                                <div
                                    key={`label-${conn.id}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedConnectionId(conn.id);
                                    }}
                                    className={`absolute px-2 py-0.5 rounded text-[10px] font-mono font-bold border transform -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-sm z-10 transition-all ${selectedConnectionId === conn.id
                                        ? 'bg-amber-500 border-amber-550 text-white'
                                        : 'bg-white dark:bg-dark-900 border-dark-200 dark:border-dark-800 text-dark-700 dark:text-dark-350 hover:border-primary-500'
                                        }`}
                                    style={{ left: midX, top: midY }}
                                >
                                    {conn.label}
                                </div>
                            );
                        })}

                        {/* Nodes / Component Cards rendering */}
                        {nodes.map((node) => {
                            const isSelected = selectedNodeId === node.id;
                            const typeMeta = COMPONENT_TYPES[node.type];
                            const isSource = connectionSource === node.id;

                            return (
                                <div
                                    key={node.id}
                                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                                    className={`absolute w-40 h-[70px] rounded-xl border p-2.5 flex flex-col justify-between cursor-grab active:cursor-grabbing shadow-sm transition-all z-20 ${isSelected
                                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                                        : isSource
                                            ? 'border-amber-500 ring-2 ring-amber-500/20 animate-pulse'
                                            : 'border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900/90'
                                        }`}
                                    style={{ left: node.x, top: node.y }}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${node.color || typeMeta?.color} text-white flex-shrink-0`}>
                                            {typeMeta?.icon}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-dark-950 dark:text-white truncate">
                                                {node.label}
                                            </span>
                                            <span className="text-[9px] text-dark-500 dark:text-dark-400 capitalize truncate">
                                                {typeMeta?.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action button to delete node */}
                                    <div className="flex items-center justify-between mt-1 text-[9px] text-dark-400 dark:text-dark-550 border-t border-dark-100 dark:border-dark-850 pt-1">
                                        <span className="truncate max-w-[100px]" title={node.description}>
                                            {node.description}
                                        </span>
                                        <button
                                            onMouseDown={(e) => e.stopPropagation()} // stop drag triggering
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNode(node.id);
                                            }}
                                            className="text-dark-400 hover:text-rose-500 transition-colors p-0.5 cursor-pointer"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Right Column: Component Details & Flow Properties Editor */}
            <div className="w-full lg:w-72 flex flex-col gap-4 flex-shrink-0">
                {/* 1. Component Node Editor */}
                {selectedNodeId && (
                    <Card className="p-4 border-l-4 border-l-primary-500 animate-slide-in">
                        <h3 className="text-xs font-bold text-dark-900 dark:text-white uppercase tracking-wider mb-3">
                            Edit Element Details
                        </h3>
                        <form onSubmit={handleSaveNodeDetails} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase mb-1">
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={nodeForm.label}
                                    onChange={(e) => setNodeForm(prev => ({ ...prev, label: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-dark-950 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase mb-1">
                                    Description / Role
                                </label>
                                <textarea
                                    value={nodeForm.description}
                                    onChange={(e) => setNodeForm(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-dark-950 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    placeholder="Write components function here..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-primary-500 hover:bg-primary-600 text-white dark:text-dark-950 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                Apply Changes
                            </button>
                        </form>
                    </Card>
                )}

                {/* 2. Flow Line Connection Editor */}
                {selectedConnectionId && (
                    <Card className="p-4 border-l-4 border-l-amber-500 animate-slide-in">
                        <h3 className="text-xs font-bold text-dark-900 dark:text-white uppercase tracking-wider mb-3">
                            Edit Data Flow
                        </h3>
                        <form onSubmit={handleSaveConnectionDetails} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase mb-1">
                                    Data Protocol / Label
                                </label>
                                <input
                                    type="text"
                                    value={connectionForm.label}
                                    onChange={(e) => setConnectionForm(prev => ({ ...prev, label: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-dark-950 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500"
                                    placeholder="e.g. HTTPS POST, gRPC, Redis Get"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteConnection(selectedConnectionId)}
                                    className="px-3 py-2 border border-rose-200 dark:border-rose-900/30 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/10 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* 3. Helper System Design Notes / Guide card */}
                <Card className="p-4">
                    <h3 className="text-xs font-bold text-dark-900 dark:text-white uppercase tracking-wider mb-2">
                        Canvas Cheat Sheet
                    </h3>
                    <ul className="space-y-1.5 text-[10px] text-dark-500 dark:text-dark-400 list-disc list-inside">
                        <li><strong>Adding elements:</strong> Click any button on the left elements block.</li>
                        <li><strong>Moving:</strong> Drag any component node around grid lines.</li>
                        <li><strong>Flow lines:</strong> Select "Flow Linker", click node A, then node B.</li>
                        <li><strong>Naming flows:</strong> Click the middle text label of any flow link.</li>
                        <li><strong>Edit Component:</strong> Click on a component body to edit its label.</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default SystemDesignCanvas;
