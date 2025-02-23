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

    // Add a section to display saved characters
    const SavedCharactersList = () => (
        <div className="mt-8 card p-6">
            <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Saved Characters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCharacters.map((char) => (
                    <div key={char.id} className="card p-4">
                        {char.image && (
                            <img 
                                src={char.image} 
                                alt={char.name}
                                className="w-full h-48 object-cover rounded-lg mb-3"
                            />
                        )}
                        <h4 className="text-lg font-medium dark:text-gray-200">{char.name}</h4>
                        <p className="text-sm dark:text-gray-300">{char.role}</p>
                        <p className="text-xs dark:text-gray-400 mt-2">
                            {new Date(char.timestamp).toLocaleDateString()}
                        </p>
                        <button 
                            onClick={() => setCharacterDetails(char)}
                            className="mt-2 button-secondary text-sm"
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="mb-16">
                <h2 className="text-4xl font-bold mb-4 dark:text-gray-100 text-center">Character Development</h2>
                <p className="dark:text-gray-300 text-lg text-center max-w-2xl mx-auto">
                    Create and customize detailed character profiles with images and save them for future reference
                </p>
            </div>

            <form onSubmit={handleSubmit} className="card">
                <div className="p-8">
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
                </div>

                <div className="flex justify-end gap-4 mt-8 pt-6 px-8 py-4 border-t dark:border-gray-700 flex align-center justify-center">
                    <button
                        type="submit"
                        className="button"
                    >
                        Save Character
                    </button>
                    <button
                        type="button"
                        onClick={generateCharacterImage}
                        disabled={isLoading}
                        className={`button ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Generating Image...' : 'Generate Character Image'}
                    </button>
                </div>
            </form>

            {generatedImage && (
                <div className="mt-16 card p-8">
                    <h3 className="text-2xl font-semibold mb-8 dark:text-gray-100 text-center">Character Visualization</h3>
                    <div className="max-w-2xl mx-auto">
                        <img
                            src={generatedImage}
                            alt={`${characterDetails.name}`}
                            className="w-full rounded-xl shadow-lg"
                            onError={(e) => {
                                console.error('Error loading image:', e);
                                toast.error('Error loading the generated image');
                            }}
                        />
                    </div>
                </div>
            )}

            {savedCharacters.length > 0 && (
                <div className="mt-16 card p-8 ">
                    <h3 className="text-2xl font-semibold mb-8 dark:text-gray-100 text-center">Saved Characters</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {savedCharacters.map((char) => (
                            <div key={char.id} className="character-card">
                                <div className="character-card-content">
                                    {char.image && (
                                        <div className="mb-6">
                                            <img 
                                                src={char.image} 
                                                alt={char.name}
                                                className="w-full h-48 object-cover rounded-lg shadow-md"
                                            />
                                        </div>
                                    )}
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-semibold dark:text-gray-200">{char.name}</h4>
                                        <p className="text-sm dark:text-gray-300">{char.role}</p>
                                        <p className="text-xs dark:text-gray-400">
                                            Created {new Date(char.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => setCharacterDetails(char)}
                                        className="button-secondary text-sm w-full mt-4 hover-lift"
                                    >
                                        Edit Character
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CharacterDevelopment;