import { useState } from 'react';
import { developPlot } from '../services/api';
import toast from 'react-hot-toast';

export default function PlotDevelopment() {
  const [formData, setFormData] = useState({
    story_premise: '',
    current_point: '',
    desired_outcome: ''
  });
  const [plotOutline, setPlotOutline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await developPlot(formData);
      setPlotOutline(response.plot_outline);
      toast.success('Plot outline generated successfully!');
    } catch (error) {
      toast.error('Failed to generate plot outline');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 dark:text-gray-100">Plot Development</h2>
        <p className="dark:text-gray-300 ">Structure your story with a detailed plot outline</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="input-container">
          <label className="form-label">
            Story Premise
            <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            className="input-field"
            placeholder="Enter your story's main premise..."
            rows="4"
            value={formData.story_premise}
            onChange={(e) => setFormData({ ...formData, story_premise: e.target.value })}
          />
        </div>

        <div className="input-container">
          <label className="form-label">
            Current Point in Story
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Where is your story currently? (e.g., beginning, middle, climax)"
            value={formData.current_point}
            onChange={(e) => setFormData({ ...formData, current_point: e.target.value })}
          />
        </div>

        <div className="input-container">
          <label className="form-label">
            Desired Outcome
          </label>
          <textarea
            className="input-field"
            rows="3"
            placeholder="What's your intended ending or resolution?"
            value={formData.desired_outcome}
            onChange={(e) => setFormData({ ...formData, desired_outcome: e.target.value })}
          />
        </div>

        <div className="input-container">
          <button
            type="submit"
            disabled={loading}
            className={`button w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Generating Plot...' : 'Generate Plot Outline'}
          </button>
        </div>
      </form>

      {plotOutline && (
        <div className="mt-8 card p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100 text-gray-900">Plot Outline</h3>
          <div className="prose max-w-none dark:prose-invert">
            <div className="dark:text-gray-300 text-gray-600 whitespace-pre-line">{plotOutline}</div>
          </div>
        </div>
      )}
    </div>
  );
}