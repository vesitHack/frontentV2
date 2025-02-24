import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';

const DialogueDelivery = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        character1: '',
        character2: '',
        relationship: '',
        situation: location.state?.plotOutline || '',
        emotionalTone: '',
        dialogueLength: '',
        setting: location.state?.setting || '',
        conflict: '',
        additionalContext: ''
    });
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [drafts, setDrafts] = useState([]);
    const [showDrafts, setShowDrafts] = useState(false);

    useEffect(() => {
        // Auto-fill from story data if available
        if (location.state?.mainCharacters && location.state.mainCharacters.length >= 2) {
            setFormData(prev => ({
                ...prev,
                character1: `${location.state.mainCharacters[0].name} - ${location.state.mainCharacters[0].description}`,
                character2: `${location.state.mainCharacters[1].name} - ${location.state.mainCharacters[1].description}`,
                relationship: location.state.mainCharacters[0].role + ' and ' + location.state.mainCharacters[1].role,
                setting: location.state.setting || prev.setting,
                situation: location.state.plotOutline || prev.situation,
                additionalContext: location.state.themes || prev.additionalContext
            }));
        }
    }, [location.state]);

    useEffect(() => {
        const savedDrafts = localStorage.getItem('dialogueDeliveryDrafts');
        if (savedDrafts) {
            setDrafts(JSON.parse(savedDrafts));
        }
    }, []);

    const API_KEY = 'AIzaSyDQgCTCEbkJGdH4NlVV3Tei3IOAmQtRJ9Y';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const generatePrompt = () => {
        return `Create a detailed dialogue scene between two characters with the following specifications:

        Character 1: ${formData.character1}
        Character 2: ${formData.character2}
        Their Relationship: ${formData.relationship}
        Situation: ${formData.situation}
        Emotional Tone: ${formData.emotionalTone}
        Dialogue Length: ${formData.dialogueLength}
        Setting: ${formData.setting}
        Main Conflict: ${formData.conflict}
        Additional Context: ${formData.additionalContext}

        Please provide:

        1. Scene Setup:
        - Detailed setting description
        - Character positions and initial actions
        - Atmosphere and mood

        2. Character States:
        - Initial emotional states
        - Body language and non-verbal cues
        - Character motivations in this scene

        3. Dialogue Exchange:
        - Natural conversation flow
        - Character-specific speech patterns
        - Emotional progression
        - Subtext and underlying meanings

        4. Dramatic Elements:
        - Rising tension points
        - Key revelations or turning points
        - Resolution or cliffhanger

        5. Technical Notes:
        - Stage directions
        - Tone shifts
        - Pacing guidelines

        Make the dialogue feel natural and true to each character's personality while maintaining dramatic tension.`;
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
                sceneSetup: extractSection(generatedContent, "Scene Setup"),
                characterStates: extractSection(generatedContent, "Character States"),
                dialogueExchange: extractSection(generatedContent, "Dialogue Exchange"),
                dramaticElements: extractSection(generatedContent, "Dramatic Elements"),
                technicalNotes: extractSection(generatedContent, "Technical Notes")
            };

            setResponse(parsedResponse);
            toast.success('Dialogue scene generated successfully!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to generate dialogue');
        } finally {
            setLoading(false);
        }
    };

    const extractSection = (text, sectionName) => {
        const regex = new RegExp(`${sectionName}:([\\s\\S]*?)(?=\\n\\n[\\d\\.]|$)`);
        const match = text.match(regex);
        return match ? match[1].trim() : '';
    };

    const downloadAsPDF = () => {
        if (!response) return;

        const doc = new jsPDF();
        const lineHeight = 10;
        let yPos = 20;

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Dialogue Scene', 20, yPos);
        yPos += lineHeight * 2;

        // Add each section
        const sections = [
            { title: 'Scene Setup', content: response.sceneSetup },
            { title: 'Character States', content: response.characterStates },
            { title: 'Dialogue Exchange', content: response.dialogueExchange },
            { title: 'Dramatic Elements', content: response.dramaticElements },
            { title: 'Technical Notes', content: response.technicalNotes }
        ];

        sections.forEach(section => {
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text(section.title, 20, yPos);
            yPos += lineHeight;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            const lines = doc.splitTextToSize(section.content, 170);
            doc.text(lines, 20, yPos);
            yPos += (lines.length * lineHeight) + 10;

            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
        });

        doc.save('dialogue-scene.pdf');
        toast.success('Downloaded as PDF!');
    };

    const saveDraft = () => {
        if (!response) {
            toast.error('Generate a dialogue first before saving as draft');
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
        localStorage.setItem('dialogueDeliveryDrafts', JSON.stringify(updatedDrafts));
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
        localStorage.setItem('dialogueDeliveryDrafts', JSON.stringify(updatedDrafts));
        toast.success('Draft deleted!');
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-100 mb-2">Dialogue Delivery</h2>
                    <p className="text-gray-300">Generate natural and engaging dialogue between characters</p>
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
                                            {draft.formData.character1} & {draft.formData.character2}
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

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="input-group">
                            <label className="form-label">Character 1</label>
                            <input
                                type="text"
                                name="character1"
                                value={formData.character1}
                                onChange={handleChange}
                                placeholder="Name and brief description"
                                required
                                className="input-field"
                            />
                        </div>

                        <div className="input-group">
                            <label className="form-label">Character 2</label>
                            <input
                                type="text"
                                name="character2"
                                value={formData.character2}
                                onChange={handleChange}
                                placeholder="Name and brief description"
                                required
                                className="input-field"
                            />
                        </div>

                        <div className="input-group">
                            <label className="form-label">Relationship</label>
                            <input
                                type="text"
                                name="relationship"
                                value={formData.relationship}
                                onChange={handleChange}
                                placeholder="How are they connected?"
                                className="input-field"
                            />
                        </div>

                        <div className="input-group">
                            <label className="form-label">Emotional Tone</label>
                            <select
                                name="emotionalTone"
                                value={formData.emotionalTone}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="">Select Tone</option>
                                <option value="Tense">Tense</option>
                                <option value="Friendly">Friendly</option>
                                <option value="Romantic">Romantic</option>
                                <option value="Confrontational">Confrontational</option>
                                <option value="Humorous">Humorous</option>
                                <option value="Dramatic">Dramatic</option>
                                <option value="Mysterious">Mysterious</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="form-label">Dialogue Length</label>
                            <select
                                name="dialogueLength"
                                value={formData.dialogueLength}
                                onChange={handleChange}
                                className="input-field"
                            >
                                <option value="">Select Length</option>
                                <option value="Short">Short (2-3 minutes)</option>
                                <option value="Medium">Medium (5-7 minutes)</option>
                                <option value="Long">Long (10+ minutes)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="form-label">Setting</label>
                            <input
                                type="text"
                                name="setting"
                                value={formData.setting}
                                onChange={handleChange}
                                placeholder="Where does this scene take place?"
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="input-group">
                            <label className="form-label">Situation/Context</label>
                            <textarea
                                name="situation"
                                value={formData.situation}
                                onChange={handleChange}
                                placeholder="What's happening in this scene?"
                                rows="3"
                                className="input-field"
                            />
                        </div>

                        <div className="input-group">
                            <label className="form-label">Main Conflict</label>
                            <textarea
                                name="conflict"
                                value={formData.conflict}
                                onChange={handleChange}
                                placeholder="What's the main tension or conflict?"
                                rows="3"
                                className="input-field"
                            />
                        </div>

                        <div className="input-group">
                            <label className="form-label">Additional Context</label>
                            <textarea
                                name="additionalContext"
                                value={formData.additionalContext}
                                onChange={handleChange}
                                placeholder="Any other important details?"
                                rows="3"
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="button-green w-full max-w-md"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating Dialogue...
                                </div>
                            ) : (
                                'Generate Dialogue'
                            )}
                        </button>
                    </div>
                </form>

                {response && (
                    <div className="mt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Generated Dialogue Scene</h3>
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
                                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Scene Setup</h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {response.sceneSetup}
                                </div>
                            </div>

                            <div className="card p-4 bg-white dark:bg-gray-800">
                                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Character States</h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {response.characterStates}
                                </div>
                            </div>

                            <div className="card p-4 bg-white dark:bg-gray-800">
                                <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Dialogue Exchange</h4>
                                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                    {response.dialogueExchange}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="card p-4 bg-white dark:bg-gray-800">
                                    <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Dramatic Elements</h4>
                                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                        {response.dramaticElements}
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
        </div>
    );
};

export default DialogueDelivery; 