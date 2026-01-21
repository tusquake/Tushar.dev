import { useState } from 'react';
import { contactAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await contactAPI.submit(formData);
            setSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            label: 'Email',
            value: 'tushar.seth@example.com',
            href: 'mailto:tushar.seth@example.com',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            label: 'Location',
            value: 'India',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
            ),
            label: 'GitHub',
            value: 'github.com/tusharseth',
            href: 'https://github.com/tusharseth',
        },
        {
            icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
            ),
            label: 'LinkedIn',
            value: 'linkedin.com/in/tusharseth',
            href: 'https://linkedin.com/in/tusharseth',
        },
    ];

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="section-title">Get In Touch</h1>
                    <p className="mt-4 section-subtitle mx-auto">
                        Have a question or want to work together? I'd love to hear from you!
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <Card className="p-8">
                        <h2 className="text-2xl font-semibold text-dark-900 dark:text-white mb-6">
                            Send a Message
                        </h2>

                        {success && (
                            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Your message has been sent successfully! I'll get back to you soon.</span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-3">
                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <Input
                                    label="Your Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                                <Input
                                    label="Your Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <Input
                                label="Subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="What's this about?"
                            />

                            <Input
                                label="Message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Your message here..."
                                textarea
                                rows={5}
                                required
                            />

                            <Button
                                type="submit"
                                loading={loading}
                                className="w-full"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                Send Message
                            </Button>
                        </form>
                    </Card>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-dark-900 dark:text-white mb-6">
                                Contact Information
                            </h2>
                            <p className="text-dark-500 dark:text-dark-400 mb-8">
                                Feel free to reach out through any of the following channels. I typically respond within 24-48 hours.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {contactInfo.map((info, index) => (
                                <Card key={index} className="p-4" hover={!!info.href}>
                                    {info.href ? (
                                        <a
                                            href={info.href}
                                            target={info.href.startsWith('http') ? '_blank' : undefined}
                                            rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                            className="flex items-center gap-4"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                                                {info.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm text-dark-500 dark:text-dark-400">{info.label}</p>
                                                <p className="font-medium text-dark-900 dark:text-white">{info.value}</p>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                                                {info.icon}
                                            </div>
                                            <div>
                                                <p className="text-sm text-dark-500 dark:text-dark-400">{info.label}</p>
                                                <p className="font-medium text-dark-900 dark:text-white">{info.value}</p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>

                        {/* Map placeholder */}
                        <Card className="h-48 bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center overflow-hidden">
                            <span className="text-4xl">🌍</span>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
