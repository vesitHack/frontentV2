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
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 dark:text-gray-100">Text Analysis</h2>
        <p className="dark:text-gray-300 ">Get feedback on your writing style, pacing, and more</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="input-container">
          <label className="form-label">
            Your Text
            <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            className="input-field"
            rows="10"
            placeholder="Paste your text here for analysis..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="input-container">
          <button
            type="submit"
            disabled={loading}
            className={`button w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Analyzing...' : 'Analyze Text'}
          </button>
        </div>
      </form>

      {analysis && (
        <div className="mt-8 card p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100 text-gray-900">Analysis Results</h3>
          <div className="prose max-w-none dark:prose-invert">
            <div className="dark:text-gray-300 text-gray-600 whitespace-pre-line">{analysis}</div>
          </div>
        </div>
      )}
    </div>
  );
}