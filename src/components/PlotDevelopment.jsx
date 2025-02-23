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
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Plot Development</h2>
        <p className="text-gray-600">Structure your story with a detailed plot outline</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-soft mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Story Premise
            <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            className="w-full px-6 py-3 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200 min-h-[120px]"
            placeholder="Enter your story's main premise..."
            value={formData.story_premise}
            onChange={(e) => setFormData({ ...formData, story_premise: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Point in Story
          </label>
          <input
            type="text"
            className="w-full px-6 py-3 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            placeholder="Where is your story currently? (e.g., beginning, middle, climax)"
            value={formData.current_point}
            onChange={(e) => setFormData({ ...formData, current_point: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desired Outcome
          </label>
          <textarea
            className="w-full px-6 py-3 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            rows="3"
            placeholder="What's your intended ending or resolution?"
            value={formData.desired_outcome}
            onChange={(e) => setFormData({ ...formData, desired_outcome: e.target.value })}
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
          {loading ? 'Generating Plot...' : 'Generate Plot Outline'}
        </button>
      </form>

      {plotOutline && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-soft">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Plot Outline</h3>
          <div className="prose max-w-none">
            <div className="text-gray-600 whitespace-pre-line">{plotOutline}</div>
          </div>
        </div>
      )}
    </div>
  );
}