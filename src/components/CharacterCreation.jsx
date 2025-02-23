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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Character Creation</h2>
        <p className="text-gray-600">Create detailed and compelling characters for your story</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-soft">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Character Name
            <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            className="w-full px-4 py-2 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            placeholder="Enter character name..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="w-full px-4 py-2 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            rows="2"
            placeholder="Brief description of the character..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Character Traits (comma-separated)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            placeholder="e.g., brave, intelligent, stubborn..."
            value={formData.traits}
            onChange={(e) => setFormData({ ...formData, traits: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backstory
          </label>
          <textarea
            className="w-full px-4 py-2 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            rows="4"
            placeholder="Character's background story..."
            value={formData.backstory}
            onChange={(e) => setFormData({ ...formData, backstory: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          } transition-colors duration-200 shadow-sm`}
        >
          {loading ? 'Creating Character...' : 'Create Character'}
        </button>
      </form>

      {characterProfile && (
        <div className="mt-8 bg-white p-8 rounded-xl shadow-soft">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Character Profile</h3>
          <div className="prose max-w-none">
            <div className="text-gray-600 whitespace-pre-line">{characterProfile}</div>
          </div>
        </div>
      )}
    </div>
  );
}