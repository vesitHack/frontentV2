import { useState } from 'react';
import { createCharacter } from '../services/api';
import toast from 'react-hot-toast';

export default function CharacterCreation() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    traits: '',
    backstory: ''
  });
  const [characterProfile, setCharacterProfile] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await createCharacter({
        ...formData,
        traits: formData.traits ? formData.traits.split(',').map(t => t.trim()) : []
      });
      setCharacterProfile(response.character_profile);
      toast.success('Character profile generated successfully!');
    } catch (error) {
      toast.error('Failed to generate character profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 dark:text-gray-100">Character Creation</h2>
        <p className="dark:text-gray-300 ">Create detailed and compelling characters for your story</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="input-container">
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Character Name
            <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            className="input-field"
            placeholder="Enter character name..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="input-container">
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Description
          </label>
          <textarea
            className="input-field"
            rows="3"
            placeholder="Brief description of the character..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="input-container">
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Character Traits (comma-separated)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g., brave, intelligent, stubborn..."
            value={formData.traits}
            onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
          />
        </div>

        <div className="input-container">
          <label className="block text-sm font-medium mb-2 dark:text-gray-200">
            Backstory
          </label>
          <textarea
            className="input-field"
            rows="4"
            placeholder="Character's background story..."
            value={formData.backstory}
            onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
          />
        </div>

        <div className="input-container">
          <button
            type="submit"
            disabled={loading}
            className={`button w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating Character...' : 'Create Character'}
          </button>
        </div>
      </form>

      {characterProfile && (
        <div className="mt-8 card p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Character Profile</h3>
          <div className="prose max-w-none dark:prose-invert">
            <div className="dark:text-gray-300 text-gray-600 whitespace-pre-line">{characterProfile}</div>
          </div>
        </div>
      )}
    </div>
  );
}