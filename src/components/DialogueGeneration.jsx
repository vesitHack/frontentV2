import { useState } from 'react';
import { generateDialogue } from '../services/api';
import toast from 'react-hot-toast';

export default function DialogueGeneration() {
  const [formData, setFormData] = useState({
    character_name: '',
    context: '',
    personality: ''
  });
  const [dialogue, setDialogue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await generateDialogue(formData);
      setDialogue(response.dialogue);
      toast.success('Dialogue generated successfully!');
    } catch (error) {
      toast.error('Failed to generate dialogue');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dialogue Generation</h2>
        <p className="text-gray-600">Create natural and engaging dialogue for your characters</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-soft mx-auto">
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
            value={formData.character_name}
            onChange={(e) => setFormData({ ...formData, character_name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Context
            <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            className="w-full px-4 py-2 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            rows="4"
            placeholder="Describe the scene or situation..."
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Character Personality
          </label>
          <textarea
            className="w-full px-4 py-2 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            rows="2"
            placeholder="Describe the character's personality..."
            value={formData.personality}
            onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-lg text-white font-medium text-lg ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary-600 hover:bg-primary-700'
          } transition-colors duration-200 shadow-sm`}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </form>

      {dialogue && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-soft">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Generated Dialogue</h3>
          <div className="prose max-w-none">
            <div className="text-gray-600 whitespace-pre-line">{dialogue}</div>
          </div>
        </div>
      )}
    </div>
  );
}