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
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-2xl text-gray-800 font-semibold mb-4">Saved Characters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedCharacters.map((char) => (
                    <div key={char.id} className="bg-gray-50 p-4 rounded-lg">
                        {char.image && (
                            <img 
                                src={char.image} 
                                alt={char.name}
                                className="w-full h-48 object-cover rounded-lg mb-3"
                            />
                        )}
                        <h4 className="text-lg font-medium text-gray-800">{char.name}</h4>
                        <p className="text-sm text-gray-600">{char.role}</p>
                        <p className="text-xs text-gray-500 mt-2">
                            {new Date(char.timestamp).toLocaleDateString()}
                        </p>
                        <button 
                            onClick={() => setCharacterDetails(char)}
                            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="bg-white p-8 rounded-2xl mt-8 shadow-md">
            <h2 className="text-3xl text-[#1a1a1a] mb-8 text-center font-bold">
                Create New Character
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[1200px] mx-auto">
                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2c3e50] text-sm">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={characterDetails.name}
                        onChange={handleChange}
                        placeholder="Character Name"
                        required
                        className="p-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-10"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2c3e50] text-sm">Role</label>
                    <input
                        type="text"
                        name="role"
                        value={characterDetails.role}
                        onChange={handleChange}
                        placeholder="Character Role"
                        className="p-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-10"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2c3e50] text-sm">Age</label>
                    <input
                        type="text"
                        name="age"
                        value={characterDetails.age}
                        onChange={handleChange}
                        placeholder="Character Age"
                        className="p-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 transition-all focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-10"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2c3e50] text-sm">Description</label>
                    <textarea
                        name="description"
                        value={characterDetails.description}
                        onChange={handleChange}
                        placeholder="General character description"
                        className="p-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 min-h-[100px] resize-y transition-all focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-10"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2c3e50] text-sm">Personality</label>
                    <textarea
                        name="personality"
                        value={characterDetails.personality}
                        onChange={handleChange}
                        placeholder="Character's personality traits"
                        className="p-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 min-h-[100px] resize-y transition-all focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-10"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2c3e50] text-sm">Background</label>
                    <textarea
                        name="background"
                        value={characterDetails.background}
                        onChange={handleChange}
                        placeholder="Character's background story"
                        className="p-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 min-h-[100px] resize-y transition-all focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-10"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2c3e50] text-sm">Goals</label>
                    <textarea
                        name="goals"
                        value={characterDetails.goals}
                        onChange={handleChange}
                        placeholder="Character's goals and motivations"
                        className="p-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 min-h-[100px] resize-y transition-all focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-10"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-semibold text-[#2c3e50] text-sm">Appearance</label>
                    <textarea
                        name="appearance"
                        value={characterDetails.appearance}
                        onChange={handleChange}
                        placeholder="Detailed physical appearance"
                        className="p-3 border-2 border-gray-200 rounded-lg text-sm text-gray-800 min-h-[100px] resize-y transition-all focus:outline-none focus:border-[#4a90e2] focus:ring-2 focus:ring-[#4a90e2] focus:ring-opacity-10"
                    />
                </div>

                <div className="col-span-full flex justify-end gap-4 mt-6">
                    <button 
                        type="submit" 
                        className="bg-[#4a90e2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#357abd] transform hover:-translate-y-0.5 transition-all"
                    >
                        Save Character
                    </button>
                    <button 
                        type="button"
                        onClick={generateCharacterImage}
                        disabled={isLoading}
                        className="bg-[#4a90e2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#357abd] transform hover:-translate-y-0.5 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {isLoading ? 'Generating Image...' : 'Generate Character Image'}
                    </button>
                </div>
            </form>

            {generatedImage && (
                <div className="mt-8 text-center">
                    <h3 className="text-2xl text-[#2c3e50] mb-5">Character Visualization</h3>
                    <img 
                        src={generatedImage} 
                        alt={`${characterDetails.name}`}
                        className="max-w-lg mx-auto rounded-xl shadow-md"
                        onError={(e) => {
                            console.error('Error loading image:', e);
                            alert('Error loading the generated image');
                        }}
                    />
                </div>
            )}

            {savedCharacters.length > 0 && <SavedCharactersList />}
        </div>
    );
};

export default CharacterDevelopment; 