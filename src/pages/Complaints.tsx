import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import { useAuthStore } from '../store/authStore';
import { useRoadStore } from '../store/roadStore';
import './Complaints.css';

const Complaints: React.FC = () => {
    const user = useAuthStore(s => s.user);
    const submitComplaint = useRoadStore(s => s.submitComplaint);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
    const [status, setStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image || !location) {
            setStatus({ type: 'error', msg: 'Please provide visual evidence and ensure GPS is located to diagnose damage location.' });
            return;
        }

        setIsSubmitting(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('userId', user?.userId || '');
        formData.append('comment', comment);
        formData.append('latitude', location.lat.toString());
        formData.append('longitude', location.lng.toString());
        formData.append('image', image);

        try {
            await submitComplaint(formData);
            setStatus({ type: 'success', msg: 'Complaint submitted successfully! AI analysis is in progress.' });
            setComment('');
            setImage(null);
        } catch (err) {
            setStatus({ type: 'error', msg: 'Submission failed. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="complaints-page">
            <Navbar />
            <main className="complaints-main animate-fade-in">
                <div className="complaints-container glass-panel">
                    <header className="complaints-header">
                        <h2>Infrastructure Complaint Portal</h2>
                        <p>Your reports help us maintain safer roads using AI-powered diagnostics.</p>
                    </header>

                    <form className="complaints-form" onSubmit={handleSubmit}>
                        {/* Target road segment explicitly removed. GPS automatically dictates nearest segment association by the AI service natively. */}

                        <div className="form-row">
                            <label>Visual Evidence (Image Upload)</label>
                            <div className="image-upload-zone">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                                    id="complaint-image"
                                    hidden
                                />
                                <label htmlFor="complaint-image" className="upload-btn">
                                    {image ? `Selected: ${image.name}` : 'Click to Upload Road Image'}
                                </label>
                            </div>
                        </div>

                        <div className="form-row">
                            <label>Description (Optional)</label>
                            <textarea 
                                value={comment} 
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Describe the damage (e.g. deep pothole, faded markings)..."
                                rows={4}
                            />
                        </div>

                        <div className="location-info">
                            <span className="location-icon">📍</span>
                            {location ? (
                                <span>Detected GPS: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                            ) : (
                                <span className="loc-warning">Awaiting GPS synchronization...</span>
                            )}
                        </div>

                        {status && (
                            <div className={`status-msg ${status.type}`}>
                                {status.msg}
                            </div>
                        )}

                        <button type="submit" className="submit-complaint-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Processing AI Diagnostics...' : 'Register Complaint'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Complaints;
