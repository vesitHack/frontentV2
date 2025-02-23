import { useState, useEffect } from 'react';
import { generateStoryIdeas } from '../services/api';
import toast from 'react-hot-toast';

export default function StoryIdeas() {
  const [formData, setFormData] = useState({
    premise: '',
    genre: '',
    themes: ''
  });
  const [ideas, setIdeas] = useState('');
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [charCount, setCharCount] = useState({
    premise: 0,
    genre: 0,
    themes: 0
  });

  // Load drafts from localStorage
  useEffect(() => {
    const savedDrafts = localStorage.getItem('storyDrafts');
    if (savedDrafts) {
      setDrafts(JSON.parse(savedDrafts));
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.premise || formData.genre || formData.themes) {
        localStorage.setItem('currentStory', JSON.stringify(formData));
        toast.success('Progress auto-saved', { duration: 2000 });
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [formData]);

  const saveDraft = () => {
    const newDraft = {
      id: Date.now(),
      ...formData,
      ideas,
      date: new Date().toLocaleDateString()
    };
    const updatedDrafts = [...drafts, newDraft];
    setDrafts(updatedDrafts);
    localStorage.setItem('storyDrafts', JSON.stringify(updatedDrafts));
    toast.success('Draft saved successfully!');
  };

  const loadDraft = (draft) => {
    setFormData({
      premise: draft.premise,
      genre: draft.genre,
      themes: draft.themes
    });
    setIdeas(draft.ideas);
    setShowDrafts(false);
    toast.success('Draft loaded!');
  };

  const deleteDraft = (id) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== id);
    setDrafts(updatedDrafts);
    localStorage.setItem('storyDrafts', JSON.stringify(updatedDrafts));
    toast.success('Draft deleted!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await generateStoryIdeas({
        ...formData,
        themes: formData.themes ? formData.themes.split(',').map(t => t.trim()) : []
      });
      setIdeas(response.ideas);
      toast.success('Story ideas generated successfully!');
    } catch (error) {
      toast.error('Failed to generate story ideas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToFile = () => {
    const content = `
Story Premise:
${formData.premise}

Genre:
${formData.genre}

Themes:
${formData.themes}

Generated Ideas:
${ideas}

Generated on: ${new Date().toLocaleString()}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `story-ideas-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Story ideas exported successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 dark:text-gray-100">Story Idea Generator</h2>
        <p className="dark:text-gray-400">Generate unique story ideas based on your premise and preferences</p>
        
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={() => setShowDrafts(!showDrafts)}
            className="button-secondary"
          >
            {showDrafts ? 'Hide Drafts' : 'Show Drafts'}
          </button>
          {(formData.premise || ideas) && (
            <button
              onClick={saveDraft}
              className="button-secondary"
            >
              Save Draft
            </button>
          )}
        </div>
      </div>

      {showDrafts && (
        <div className="mb-8 card p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100">Saved Drafts</h3>
          <div className="space-y-4">
            {drafts.map(draft => (
              <div key={draft.id} className="card p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium dark:text-gray-200">{draft.premise.substring(0, 50)}...</p>
                  <p className="text-sm dark:text-gray-400 text-gray-600">Genre: {draft.genre} • {draft.date}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadDraft(draft)}
                    className="button-secondary py-2 px-3"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="py-2 px-3 rounded-lg text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {drafts.length === 0 && (
              <p className="text-center dark:text-gray-400 text-gray-600">No saved drafts yet</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="input-container">
          <label className="form-label">
            Story Premise
            <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              required
              className="input-field"
              placeholder="Enter your story premise..."
              rows="4"
              value={formData.premise}
              onChange={(e) => {
                setFormData({ ...formData, premise: e.target.value });
                setCharCount({ ...charCount, premise: e.target.value.length });
              }}
            />
            <span className="absolute bottom-2 right-2 text-sm dark:text-gray-400 text-gray-500">
              {charCount.premise}/1000
            </span>
          </div>
        </div>

        <div className="input-container">
          <label className="form-label">
            Genre
          </label>
          <div className="relative">
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Fantasy, Sci-Fi, Romance..."
              value={formData.genre}
              onChange={(e) => {
                setFormData({ ...formData, genre: e.target.value });
                setCharCount({ ...charCount, genre: e.target.value.length });
              }}
            />
            <span className="absolute bottom-2 right-2 text-sm dark:text-gray-400 text-gray-500">
              {charCount.genre}/100
            </span>
          </div>
        </div>

        <div className="input-container">
          <label className="form-label">
            Themes (comma-separated)
          </label>
          <div className="relative">
            <input
              type="text"
              className="input-field"
              placeholder="e.g., redemption, love, sacrifice..."
              value={formData.themes}
              onChange={(e) => {
                setFormData({ ...formData, themes: e.target.value });
                setCharCount({ ...charCount, themes: e.target.value.length });
              }}
            />
            <span className="absolute bottom-2 right-2 text-sm dark:text-gray-400 text-gray-500">
              {charCount.themes}/100
            </span>
          </div>
        </div>

        <div className="input-container">
          <button
            type="submit"
            disabled={loading}
            className={`button w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Generating...' : 'Generate Ideas'}
          </button>
        </div>
      </form>

      {ideas && (
        <div className="mt-8 card p-6">
          <h3 className="text-xl font-semibold mb-4 dark:text-gray-100 text-gray-900">Generated Ideas</h3>
          <div className="prose max-w-none dark:prose-invert">
            <div className="dark:text-gray-300 text-gray-600 whitespace-pre-line">{ideas}</div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={exportToFile}
              className="button-secondary flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>
      )}
    </div>
  );
}