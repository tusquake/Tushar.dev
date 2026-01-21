import { useState, useEffect } from 'react';
import { certificatesAPI } from '../services/api';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sample certificates data
    const sampleCertificates = [
        {
            _id: '1',
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            issueDate: '2024-01-15',
            credentialUrl: 'https://aws.amazon.com/certification',
        },
        {
            _id: '2',
            name: 'Meta React Developer Professional Certificate',
            issuer: 'Meta (Coursera)',
            issueDate: '2023-08-20',
            credentialUrl: 'https://coursera.org/verify',
        },
        {
            _id: '3',
            name: 'MongoDB Developer Certification',
            issuer: 'MongoDB University',
            issueDate: '2023-05-10',
            credentialUrl: 'https://university.mongodb.com',
        },
        {
            _id: '4',
            name: 'Node.js Application Development',
            issuer: 'OpenJS Foundation',
            issueDate: '2023-02-28',
            credentialUrl: 'https://openjsf.org',
        },
    ];

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await certificatesAPI.getAll();
                if (response.data.data.length > 0) {
                    setCertificates(response.data.data);
                } else {
                    setCertificates(sampleCertificates);
                }
            } catch (error) {
                console.log('Using sample certificates');
                setCertificates(sampleCertificates);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) return <Loading fullScreen />;

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="section-title">Certificates</h1>
                    <p className="mt-4 section-subtitle mx-auto">
                        Professional certifications and achievements
                    </p>
                </div>

                {/* Certificates Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert, index) => (
                        <Card
                            key={cert._id}
                            className="p-6 group"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                    </svg>
                                </div>
                                {cert.credentialUrl && (
                                    <a
                                        href={cert.credentialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-lg text-dark-400 hover:text-primary-500 hover:bg-dark-100 dark:hover:bg-dark-700 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                )}
                            </div>

                            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2 line-clamp-2">
                                {cert.name}
                            </h3>
                            <p className="text-primary-500 font-medium mb-2">{cert.issuer}</p>
                            <p className="text-sm text-dark-500 dark:text-dark-400">
                                Issued {formatDate(cert.issueDate)}
                            </p>

                            {cert.credentialUrl && (
                                <a
                                    href={cert.credentialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center text-sm text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                                >
                                    View Credential
                                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </a>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Empty state */}
                {certificates.length === 0 && (
                    <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">🏆</span>
                        <h3 className="text-xl font-semibold text-dark-900 dark:text-white mb-2">
                            No certificates yet
                        </h3>
                        <p className="text-dark-500 dark:text-dark-400">
                            Check back later for new certifications!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Certificates;
