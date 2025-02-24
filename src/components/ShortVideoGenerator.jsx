import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const ShortVideoGenerator = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        platform: '',
        contentType: '',
        targetAudience: '',
        duration: '',
        mood: '',
        topic: '',
        style: '',
        additionalDetails: ''
    });
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [drafts, setDrafts] = useState([]);
    const [showDrafts, setShowDrafts] = useState(false);

    const API_KEY = 'AIzaSyDQgCTCEbkJGdH4NlVV3Tei3IOAmQtRJ9Y';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    useEffect(() => {
        const savedDrafts = localStorage.getItem('shortVideoDrafts');
        if (savedDrafts) {
            setDrafts(JSON.parse(savedDrafts));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const generatePrompt = () => {
        return `Create a concise short video story concept for ${formData.platform} with these specifications:
            - Content Type: ${formData.contentType}
            - Target Audience: ${formData.targetAudience}
            - Duration: ${formData.duration} seconds
            - Mood: ${formData.mood}
            - Topic: ${formData.topic}
            - Style: ${formData.style}
            - Additional Requirements: ${formData.additionalDetails}

            Please provide:

            1. Story Hook & Concept (2-3 sentences):
            - Main story idea
            - Core message
            - Hook for first 3 seconds

            2. Quick Scene Breakdown:
            - Opening (0-3s)
            - Middle sections (key moments)
            - Ending/Call-to-action
            - Total should fit ${formData.duration} seconds

            3. Key Elements:
            - Main character/presenter approach
            - Essential visuals and transitions
            - Music and sound style
            - One unique viral element

            4. Technical Notes:
            - Best practices for ${formData.platform}
            - 2-3 relevant hashtags
            - Key engagement points

            Keep it punchy and practical for short-form video.`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}?key=${API_KEY}`,
                {
                    contents: [
                        {
                            parts: [{ text: generatePrompt() }]
                        }
                    ]
                }
            );

            const generatedContent = response.data.candidates[0].content.parts[0].text;
            
            const parsedResponse = {
                storyHook: extractSection(generatedContent, "Story Hook & Concept"),
                sceneBreakdown: extractSection(generatedContent, "Quick Scene Breakdown"),
                keyElements: extractSection(generatedContent, "Key Elements"),
                technicalNotes: extractSection(generatedContent, "Technical Notes")
            };

            setResponse(parsedResponse);
            toast.success('Video story concept generated successfully!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to generate video concept');
        } finally {
            setLoading(false);
        }
    };

    const extractSection = (text, sectionName) => {
        const regex = new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\n\\n[\\d\\.]|$)`);
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };

    const saveDraft = () => {
        if (!response) {
            toast.error('Generate a video concept first before saving as draft');
            return;
        }

        const newDraft = {
            id: Date.now(),
            formData,
            response,
            date: new Date().toLocaleDateString()
        };

        const updatedDrafts = [...drafts, newDraft];
        setDrafts(updatedDrafts);
        localStorage.setItem('shortVideoDrafts', JSON.stringify(updatedDrafts));
        toast.success('Draft saved successfully!');
    };

    const downloadAsPDF = () => {
        if (!response) return;

        const doc = new jsPDF();
        const lineHeight = 10;
        let yPos = 20;

        // Add title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Short Video Story Concept', 20, yPos);
        yPos += lineHeight * 2;

        // Add Story Hook & Concept
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Story Hook & Concept', 20, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const hookLines = doc.splitTextToSize(response.storyHook, 170);
        doc.text(hookLines, 20, yPos);
        yPos += (hookLines.length * lineHeight) + 10;

        // Add Scene Breakdown
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Scene Breakdown', 20, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const sceneLines = doc.splitTextToSize(response.sceneBreakdown, 170);
        doc.text(sceneLines, 20, yPos);
        yPos += (sceneLines.length * lineHeight) + 10;

        // Add Key Elements
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Elements', 20, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const elementLines = doc.splitTextToSize(response.keyElements, 170);
        doc.text(elementLines, 20, yPos);
        yPos += (elementLines.length * lineHeight) + 10;

        // Add Technical Notes
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Technical Notes', 20, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const techLines = doc.splitTextToSize(response.technicalNotes, 170);
        doc.text(techLines, 20, yPos);

        // Save the PDF
        doc.save('short-video-concept.pdf');
        toast.success('Downloaded as PDF!');
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-100 mb-2">Short Video Generator</h2>
                    <p className="text-gray-300">Generate viral-worthy short video concepts for social media</p>
                </div>
                <button
                    onClick={() => setShowDrafts(!showDrafts)}
                    className="button-secondary"
                >
                    {showDrafts ? 'Hide Drafts' : 'Show Drafts'}
                </button>
            </div>

            {showDrafts && (
                <div className="mb-8 card p-6">
                    <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Saved Drafts</h3>
                    {drafts.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No saved drafts yet</p>
                    ) : (
                        <div className="space-y-4">
                            {drafts.map((draft) => (
                                <div 
                                    key={draft.id} 
                                    className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center bg-white dark:bg-gray-800"
                                >
                                    <div className="text-gray-800 dark:text-gray-200">
                                        <h4 className="font-medium">
                                            {draft.formData.topic || 'Untitled'} - {draft.formData.platform}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Created on {draft.date}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setFormData(draft.formData);
                                                setResponse(draft.response);
                                                setShowDrafts(false);
                                            }}
                                            className="button-secondary text-sm py-1 bg-blue-500 hover:bg-blue-600 text-white"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => {
                                                const updatedDrafts = drafts.filter(d => d.id !== draft.id);
                                                setDrafts(updatedDrafts);
                                                localStorage.setItem('shortVideoDrafts', JSON.stringify(updatedDrafts));
                                                toast.success('Draft deleted!');
                                            }}
                                            className="button-secondary text-sm py-1 bg-red-500 hover:bg-red-600 text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="input-container">
                        <label className="form-label">Platform</label>
                        <select
                            name="platform"
                            value={formData.platform}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">Select Platform</option>
                            <option value="Instagram Reels">Instagram Reels</option>
                            <option value="YouTube Shorts">YouTube Shorts</option>
                            <option value="TikTok">TikTok</option>
                        </select>
                    </div>

                    <div className="input-container">
                        <label className="form-label">Content Type</label>
                        <select
                            name="contentType"
                            value={formData.contentType}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">Select Content Type</option>
                            <option value="Tutorial">Tutorial</option>
                            <option value="Story">Story</option>
                            <option value="Comedy">Comedy</option>
                            <option value="Lifestyle">Lifestyle</option>
                            <option value="Educational">Educational</option>
                            <option value="Entertainment">Entertainment</option>
                        </select>
                    </div>

                    <div className="input-container">
                        <label className="form-label">Target Audience</label>
                        <input
                            type="text"
                            name="targetAudience"
                            placeholder="e.g., Teens, Young Adults, Professionals"
                            value={formData.targetAudience}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>

                    <div className="input-container">
                        <label className="form-label">Duration (seconds)</label>
                        <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">Select Duration</option>
                            <option value="15">15 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="60">60 seconds</option>
                        </select>
                    </div>

                    <div className="input-container">
                        <label className="form-label">Mood</label>
                        <select
                            name="mood"
                            value={formData.mood}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">Select Mood</option>
                            <option value="Energetic">Energetic</option>
                            <option value="Funny">Funny</option>
                            <option value="Inspirational">Inspirational</option>
                            <option value="Informative">Informative</option>
                            <option value="Emotional">Emotional</option>
                        </select>
                    </div>

                    <div className="input-container">
                        <label className="form-label">Style</label>
                        <select
                            name="style"
                            value={formData.style}
                            onChange={handleChange}
                            required
                            className="input-field"
                        >
                            <option value="">Select Style</option>
                            <option value="Vlog">Vlog</option>
                            <option value="Animation">Animation</option>
                            <option value="Cinematic">Cinematic</option>
                            <option value="Documentary">Documentary</option>
                            <option value="Music Video">Music Video</option>
                        </select>
                    </div>
                </div>

                <div className="input-container">
                    <label className="form-label">Topic/Theme</label>
                    <input
                        type="text"
                        name="topic"
                        placeholder="Main topic or theme of your video"
                        value={formData.topic}
                        onChange={handleChange}
                        required
                        className="input-field"
                    />
                </div>

                <div className="input-container">
                    <label className="form-label">Additional Details</label>
                    <textarea
                        name="additionalDetails"
                        placeholder="Any specific requirements, trends to incorporate, or special elements..."
                        value={formData.additionalDetails}
                        onChange={handleChange}
                        rows="4"
                        className="input-field"
                    />
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`button w-full max-w-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Concept...
                            </div>
                        ) : (
                            'Generate Video Concept'
                        )}
                    </button>
                </div>
            </form>

            {response && (
                <div className="mt-8 card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Generated Video Story</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={downloadAsPDF}
                                className="button-secondary flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download PDF
                            </button>
                            <button
                                onClick={saveDraft}
                                className="button-green flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Save as Draft
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="card p-4 bg-white dark:bg-gray-800">
                            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Story Hook & Concept</h4>
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {response.storyHook}
                            </div>
                        </div>

                        <div className="card p-4 bg-white dark:bg-gray-800">
                            <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Scene Breakdown</h4>
                            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {response.sceneBreakdown}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="card p-4 bg-white dark:bg-gray-800">
                                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Key Elements</h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {response.keyElements}
                                </div>
                            </div>

                            <div className="card p-4 bg-white dark:bg-gray-800">
                                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Technical Notes</h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {response.technicalNotes}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShortVideoGenerator; 