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
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 dark:text-gray-100">Dialogue Generation</h2>
        <p className="dark:text-gray-300">Create natural and engaging dialogue for your characters</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="input-container">
          <label className="form-label">
            Character Name
            <span className="text-red-500">*</span>
          </label>
          <input
            required
            type="text"
            className="input-field"
            placeholder="Enter character name..."
            value={formData.character_name}
            onChange={(e) => setFormData({ ...formData, character_name: e.target.value })}
          />
        </div>

        <div className="input-container">
          <label className="form-label">
            Context
            <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            className="input-field"
            rows="4"
            placeholder="Describe the scene or situation..."
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
          />
        </div>

        <div className="input-container">
          <label className="form-label">
            Character Personality
          </label>
          <textarea
            className="input-field"
            rows="3"
            placeholder="Describe the character's personality..."
            value={formData.personality}
            onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
          />
        </div>

        <div className="input-container">
          <button
            type="submit"
            disabled={loading}
            className={`button w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Generating...' : 'Generate Dialogue'}
          </button>
        </div>
      </form>

      {dialogue && (
        <div className="mt-8 card p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100 text-gray-900">Generated Dialogue</h3>
          <div className="prose max-w-none dark:prose-invert">
            <div className="dark:text-gray-300 text-gray-600 whitespace-pre-line">{dialogue}</div>
          </div>
        </div>
      )}
    </div>
  );
}