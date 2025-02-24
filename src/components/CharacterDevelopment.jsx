import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fal } from "@fal-ai/client";
import toast from 'react-hot-toast';

const CharacterDevelopment = () => {
    const location = useLocation();
    const initialCharacter = location.state?.character || {
        name: '',
        role: '',
        description: '',
        age: '',
        personality: '',
        background: '',
        goals: '',
        appearance: ''
    };

    const [characterDetails, setCharacterDetails] = useState(initialCharacter);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [savedCharacters, setSavedCharacters] = useState([]);

    // Configure fal client
    fal.config({
        credentials: 'f45f0110-645b-4d0b-8317-7dface66aa99:8c6ecf6a1ba5a9c07d1d68c260bf304e'
    });

    // Load character data from sessionStorage on mount
    useEffect(() => {
        const savedCharacterData = sessionStorage.getItem('currentCharacter');
        const savedImage = sessionStorage.getItem('characterImage');
        const savedCharactersList = sessionStorage.getItem('savedCharacters');

        if (location.state?.character) {
            setCharacterDetails(location.state.character);
            sessionStorage.setItem('currentCharacter', JSON.stringify(location.state.character));
        } else if (savedCharacterData) {
            setCharacterDetails(JSON.parse(savedCharacterData));
        }

        if (savedImage) {
            setGeneratedImage(savedImage);
        }

        if (savedCharactersList) {
            setSavedCharacters(JSON.parse(savedCharactersList));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const updatedDetails = {
            ...characterDetails,
            [e.target.name]: e.target.value
        };
        setCharacterDetails(updatedDetails);
        sessionStorage.setItem('currentCharacter', JSON.stringify(updatedDetails));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const characterToSave = {
            ...characterDetails,
            image: generatedImage,
            id: Date.now().toString()
        };

        const updatedCharacters = [...savedCharacters, characterToSave];
        setSavedCharacters(updatedCharacters);
        
        // Use sessionStorage instead of localStorage
        sessionStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
        
        toast.success('Character saved successfully!');
    };

    const generateCharacterImage = async () => {
        setIsLoading(true);
        try {
            const fullPrompt = `Generate a detailed portrait of ${characterDetails.name}, 
                who is ${characterDetails.description}. 
                They are a ${characterDetails.role}. 
                Physical appearance: ${characterDetails.appearance}. 
                Their personality is ${characterDetails.personality}. 
                High quality, detailed character portrait, 4k, highly detailed, professional lighting`;

            const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
                input: {
                    prompt: fullPrompt,
                    negative_prompt: "deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation"
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log) => log.message).forEach(console.log);
                    }
                },
            });

            if (result.data?.images?.[0]) {
                const imageData = result.data.images[0];
                const imageUrl = imageData.url || imageData;
                setGeneratedImage(imageUrl);
                sessionStorage.setItem('characterImage', imageUrl);
                toast.success('Image generated successfully!');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            toast.error('Failed to generate image');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-100 mb-2">Character Development</h2>
            <p className="text-gray-300 mb-8">Develop detailed character profiles with AI assistance</p>

            <div className="card p-6">
                <form onSubmit={handleSubmit} className="space-y-6 mb-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-black dark:text-gray-200">Basic Information</h3>
                            <div className="space-y-6">
                                <div className="input-group">
                                    <label className="form-label">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={characterDetails.name}
                                        onChange={handleChange}
                                        placeholder="Character Name"
                                        required
                                        className="input-field"
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="form-label">Role</label>
                                    <input
                                        type="text"
                                        name="role"
                                        value={characterDetails.role}
                                        onChange={handleChange}
                                        placeholder="Character Role"
                                        className="input-field"
                                    />
                                </div>

                                <div className="input-group">
                                    <label className="form-label">Age</label>
                                    <input
                                        type="text"
                                        name="age"
                                        value={characterDetails.age}
                                        onChange={handleChange}
                                        placeholder="Character Age"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 text-black dark:text-gray-200">Character Essence</h3>
                            <div className="space-y-6">
                                <div className="textarea-container">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        name="description"
                                        value={characterDetails.description}
                                        onChange={handleChange}
                                        placeholder="General character description"
                                        className="input-field"
                                    />
                                </div>

                                <div className="textarea-container">
                                    <label className="form-label">Personality</label>
                                    <textarea
                                        name="personality"
                                        value={characterDetails.personality}
                                        onChange={handleChange}
                                        placeholder="Character's personality traits"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2">
                            <h3 className="text-lg font-semibold mb-4 text-black dark:text-gray-200">Character Development</h3>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="textarea-container">
                                    <label className="form-label">Background</label>
                                    <textarea
                                        name="background"
                                        value={characterDetails.background}
                                        onChange={handleChange}
                                        placeholder="Character's background story"
                                        className="input-field"
                                    />
                                </div>

                                <div className="textarea-container">
                                    <label className="form-label">Goals & Motivations</label>
                                    <textarea
                                        name="goals"
                                        value={characterDetails.goals}
                                        onChange={handleChange}
                                        placeholder="Character's goals and motivations"
                                        className="input-field"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-span-2 mt-8">
                            <h3 className="text-lg font-semibold mb-4 text-black dark:text-gray-200">Physical Details</h3>
                            <div className="input-container w-full">
                                <textarea
                                    name="appearance"
                                    value={characterDetails.appearance}
                                    onChange={handleChange}
                                    placeholder="Detailed physical appearance"
                                    rows="4"
                                    className="input-field"
                                />
                            </div>
                        </div>
                    </div>
                </form>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={handleSubmit}
                        className="button-green flex-1"
                    >
                        Save Character
                    </button>
                    <button
                        onClick={generateCharacterImage}
                        className="button-green flex-1 flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Generate Character Image
                            </>
                        )}
                    </button>
                </div>

                {generatedImage && (
                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Generated Character Image</h3>
                        <img src={generatedImage} alt="Generated character" className="rounded-lg max-w-md mx-auto" />
                    </div>
                )}

                <div className="mt-8 border-t dark:border-gray-700 pt-8">
                    <h3 className="text-xl font-semibold mb-4 dark:text-gray-200">Saved Characters</h3>
                    {savedCharacters.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400">No characters saved yet</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {savedCharacters.map((character, index) => (
                                <div 
                                    key={index}
                                    className="p-4 rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800"
                                >
                                    <div className="text-gray-800 dark:text-gray-200">
                                        <h4 className="font-medium text-lg mb-2">{character.name}</h4>
                                        <p className="text-sm mb-2">
                                            <span className="font-medium">Role:</span> {character.role}
                                        </p>
                                        <p className="text-sm mb-2">
                                            <span className="font-medium">Age:</span> {character.age}
                                        </p>
                                        {character.description && (
                                            <p className="text-sm mb-2">
                                                <span className="font-medium">Description:</span> {character.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => setCharacterDetails(character)}
                                            className="button-secondary text-sm py-1 bg-blue-500 hover:bg-blue-600 text-white"
                                        >
                                            Edit Character
                                        </button>
                                        <button
                                            onClick={() => {
                                                const updatedCharacters = savedCharacters.filter((_, i) => i !== index);
                                                setSavedCharacters(updatedCharacters);
                                                sessionStorage.setItem('savedCharacters', JSON.stringify(updatedCharacters));
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
            </div>
        </div>
    );
};

export default CharacterDevelopment;