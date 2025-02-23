import { useState } from 'react';
import { analyzeText } from '../services/api';
import toast from 'react-hot-toast';

export default function TextAnalysis() {
  const [text, setText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }
    
    setLoading(true);
    try {
      const response = await analyzeText(text);
      setAnalysis(response.analysis);
      toast.success('Text analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze text');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Text Analysis</h2>
        <p className="text-gray-600">Get feedback on your writing style, pacing, and more</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-soft mx-auto">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Text
            <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            className="w-full px-4 py-2 bg-light-200 text-gray-800 rounded-lg border border-light-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none transition-colors duration-200"
            rows="10"
            placeholder="Paste your text here for analysis..."
            value={text}
            onChange={(e) => setText(e.target.value)}
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
          {loading ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </form>

      {analysis && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-soft">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Analysis Results</h3>
          <div className="prose max-w-none">
            <div className="text-gray-600 whitespace-pre-line">{analysis}</div>
          </div>
        </div>
      )}
    </div>
  );
}