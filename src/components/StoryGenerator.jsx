import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const StoryGenerator = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        genre: '',
        tone: '',
        keywords: '',
        storyLength: '',
        additionalDetails: ''
    });
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const responseRef = useRef(null);
    const [drafts, setDrafts] = useState([]);
    const [showDrafts, setShowDrafts] = useState(false);

    const API_KEY = 'AIzaSyDQgCTCEbkJGdH4NlVV3Tei3IOAmQtRJ9Y';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    // Load saved response from localStorage on component mount
    useEffect(() => {
        const savedResponse = localStorage.getItem('storyGeneratorResponse');
        if (savedResponse) {
            setResponse(JSON.parse(savedResponse));
        }
    }, []);

    // Load drafts from localStorage on component mount
    useEffect(() => {
        const savedDrafts = localStorage.getItem('storyGeneratorDrafts');
        if (savedDrafts) {
            setDrafts(JSON.parse(savedDrafts));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Optionally clear saved response when user starts modifying form
        localStorage.removeItem('storyGeneratorResponse');
        setResponse(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);

        try {
            const prompt = `Generate a story idea based on the following preferences in JSON format:
            {
                "storyIdea": "Main story concept",
                "plotOutline": ["Key plot points"],
                "mainCharacters": [{
                    "name": "Character name",
                    "description": "Character description",
                    "role": "Character's role in story"
                }],
                "setting": "Story setting description",
                "themes": ["Main themes"],
                "potentialConflicts": ["Possible conflicts"]
            }

            User Preferences:
            Genre: ${formData.genre}
            Tone: ${formData.tone}
            Keywords/Themes: ${formData.keywords}
            Story Length: ${formData.storyLength}
            Additional Details: ${formData.additionalDetails}`;

            const response = await axios.post(`${API_URL}?key=${API_KEY}`, {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            });

            const responseText = response.data.candidates[0].content.parts[0].text;
            const jsonStart = responseText.indexOf('{');
            const jsonEnd = responseText.lastIndexOf('}') + 1;
            const jsonStr = responseText.slice(jsonStart, jsonEnd);
            const parsedResponse = JSON.parse(jsonStr);
            
            // Save response to localStorage
            localStorage.setItem('storyGeneratorResponse', JSON.stringify(parsedResponse));
            setResponse(parsedResponse);
        } catch (error) {
            console.error('Error:', error);
            setResponse(null);
        }
        setLoading(false);
    };

    const handleCharacterDevelopment = (character) => {
        // Log the character data being passed
        console.log('Character being passed:', character);
        
        navigate('/characters', { 
            state: { 
                character: {
                    name: character.name,
                    role: character.role,
                    description: character.description,
                    age: '',
                    personality: character.description, // Use description as initial personality
                    background: '',
                    goals: '',
                    appearance: character.description // Use description as initial appearance
                }
            }
        });
    };

    const saveDraft = () => {
        if (!response) {
            toast.error('Generate a story first before saving as draft');
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
        localStorage.setItem('storyGeneratorDrafts', JSON.stringify(updatedDrafts));
        toast.success('Draft saved successfully!');
    };

    const loadDraft = (draft) => {
        setFormData(draft.formData);
        setResponse(draft.response);
        setShowDrafts(false);
        toast.success('Draft loaded successfully!');
    };

    const deleteDraft = (id) => {
        const updatedDrafts = drafts.filter(draft => draft.id !== id);
        setDrafts(updatedDrafts);
        localStorage.setItem('storyGeneratorDrafts', JSON.stringify(updatedDrafts));
        toast.success('Draft deleted!');
    };

    const downloadAsPDF = () => {
        if (!response) return;

        const doc = new jsPDF();
        const lineHeight = 10;
        let yPos = 20;

        // Add title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Generated Story Concept', 20, yPos);
        yPos += lineHeight * 2;

        // Add Story Idea
        doc.setFontSize(16);
        doc.text('Story Idea', 20, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const storyIdeaLines = doc.splitTextToSize(response.storyIdea, 170);
        doc.text(storyIdeaLines, 20, yPos);
        yPos += (storyIdeaLines.length * lineHeight) + 10;

        // Add Plot Outline
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Plot Outline', 20, yPos);
        yPos += lineHeight;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        response.plotOutline.forEach(point => {
            const lines = doc.splitTextToSize(`• ${point}`, 170);
            doc.text(lines, 20, yPos);
            yPos += (lines.length * lineHeight) + 5;
        });
        yPos += lineHeight;

        // Add Characters
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Main Characters', 20, yPos);
        yPos += lineHeight;
        
        response.mainCharacters.forEach(character => {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(character.name, 20, yPos);
            yPos += lineHeight;
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Role: ${character.role}`, 20, yPos);
            yPos += lineHeight;
            
            const descLines = doc.splitTextToSize(character.description, 170);
            doc.text(descLines, 20, yPos);
            yPos += (descLines.length * lineHeight) + 10;
        });

        // Save the PDF
        doc.save('generated-story-concept.pdf');
        toast.success('Story downloaded as PDF!');
    };

    const handleDialogueGeneration = () => {
        navigate('/dialogue', {
            state: {
                mainCharacters: response.mainCharacters,
                setting: response.setting,
                plotOutline: response.plotOutline,
                themes: response.themes
            }
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-100 mb-2">Story Generator</h2>
                    <p className="text-gray-300">Generate unique story ideas based on your preferences</p>
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
                                    className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center"
                                >
                                    <div>
                                        <h4 className="font-medium dark:text-gray-200">
                                            {draft.formData.genre || 'Untitled'} Story
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Created on {draft.date}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => loadDraft(draft)}
                                            className="button-secondary text-sm"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => deleteDraft(draft.id)}
                                            className="button-secondary text-sm text-red-500 hover:text-red-600"
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
                <div className="input-container">
                    <label className="form-label">Genre</label>
                    <select
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        required
                        className="input-field text-gray-700"
                    >
                        <option value="" className="text-gray-500">Select Genre</option>
                        <option value="fantasy">Fantasy</option>
                        <option value="sci-fi">Science Fiction</option>
                        <option value="mystery">Mystery</option>
                        <option value="romance">Romance</option>
                        <option value="thriller">Thriller</option>
                        <option value="horror">Horror</option>
                    </select>
                </div>

                <div className="input-container">
                    <label className="form-label">Tone</label>
                    <select
                        name="tone"
                        value={formData.tone}
                        onChange={handleChange}
                        required
                        className="input-field text-gray-700"
                    >
                        <option value="" className="text-gray-500">Select Tone</option>
                        <option value="dark">Dark</option>
                        <option value="lighthearted">Lighthearted</option>
                        <option value="suspenseful">Suspenseful</option>
                        <option value="humorous">Humorous</option>
                        <option value="dramatic">Dramatic</option>
                    </select>
                </div>

                <div className="input-container">
                    <label className="form-label">Keywords/Themes</label>
                    <input
                        type="text"
                        name="keywords"
                        placeholder="Enter keywords (comma-separated)"
                        value={formData.keywords}
                        onChange={handleChange}
                        required
                        className="input-field"
                    />
                </div>

                <div className="input-container">
                    <label className="form-label">Story Length</label>
                    <select
                        name="storyLength"
                        value={formData.storyLength}
                        onChange={handleChange}
                        required
                        className="input-field text-gray-700"
                    >
                        <option value="" className="text-gray-500">Select Story Length</option>
                        <option value="flash">Flash Fiction (&lt;1000 words)</option>
                        <option value="short">Short Story (1000-7500 words)</option>
                        <option value="novella">Novella (7500-40000 words)</option>
                        <option value="novel">Novel (40000+ words)</option>
                    </select>
                </div>

                <div className="input-container">
                    <label className="form-label">Additional Details</label>
                    <textarea
                        name="additionalDetails"
                        placeholder="Any specific requirements or details..."
                        value={formData.additionalDetails}
                        onChange={handleChange}
                        rows="4"
                        className="input-field"
                    />
                </div>

                <div className="input-container">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`button w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Story...
                            </>
                        ) : (
                            'Generate Story'
                        )}
                    </button>
                </div>
            </form>

            {response && (
                <div className="mt-8 card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold dark:text-gray-100">Generated Story Concept</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={downloadAsPDF}
                                className="button-secondary flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
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
                            <button
                                onClick={handleDialogueGeneration}
                                className="button-green flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Generate Dialogue
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6 text-black">
                        <div className="card p-4">
                            <h4 className="font-medium mb-2 dark:text-gray-200">Story Idea</h4>
                            <p className="dark:text-gray-300">{response.storyIdea}</p>
                        </div>

                        <div className="card p-4">
                            <h4 className="font-medium mb-2 dark:text-gray-200">Plot Outline</h4>
                            <ul className="list-disc list-inside space-y-2">
                                {response.plotOutline.map((point, index) => (
                                    <li key={index} className="dark:text-gray-300">{point}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="card p-4">
                            <h4 className="font-medium mb-4 dark:text-gray-200">Main Characters</h4>
                            <div className="grid gap-4">
                                {response.mainCharacters.map((character, index) => (
                                    <div key={index} className="card p-4">
                                        <h5 className="font-medium text-primary-500 dark:text-primary-400 mb-2">{character.name}</h5>
                                        <p className="dark:text-gray-200 mb-2">
                                            <span className="font-medium">Role:</span> {character.role}
                                        </p>
                                        <p className="dark:text-gray-300 mb-4">{character.description}</p>
                                        <button 
                                            onClick={() => handleCharacterDevelopment(character)}
                                            className="button-green"
                                        >
                                            Develop Character
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card p-4">
                            <h4 className="font-medium mb-2 dark:text-gray-200">Setting</h4>
                            <p className="dark:text-gray-300">{response.setting}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="card p-4">
                                <h4 className="font-medium mb-2 dark:text-gray-200">Themes</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {response.themes.map((theme, index) => (
                                        <li key={index} className="dark:text-gray-300">{theme}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="card p-4">
                                <h4 className="font-medium mb-2 dark:text-gray-200">Potential Conflicts</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {response.potentialConflicts.map((conflict, index) => (
                                        <li key={index} className="dark:text-gray-300">{conflict}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryGenerator;