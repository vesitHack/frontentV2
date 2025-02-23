import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

    const API_KEY = 'AIzaSyDQgCTCEbkJGdH4NlVV3Tei3IOAmQtRJ9Y';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    // Load saved response from localStorage on component mount
    useEffect(() => {
        const savedResponse = localStorage.getItem('storyGeneratorResponse');
        if (savedResponse) {
            setResponse(JSON.parse(savedResponse));
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

    return (
        <div className="max-w-4xl mx-auto px-4">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 dark:text-gray-100">Story Generator Playground</h2>
                <p className="dark:text-gray-300 ">Create detailed story concepts with AI assistance</p>
            </div>

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
                    <h3 className="text-xl font-semibold mb-6 dark:text-gray-100 text-gray-900">Generated Story Concept</h3>

                    <div className="space-y-6">
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
                                            className="button-secondary"
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