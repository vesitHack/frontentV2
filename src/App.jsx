import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import {
  BookOpenIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

// Components
import StoryIdeas from './components/StoryIdeas'
import PlotDevelopment from './components/PlotDevelopment'
import CharacterCreation from './components/CharacterCreation'
import DialogueGeneration from './components/DialogueGeneration'
import TextAnalysis from './components/TextAnalysis'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const navigation = [
    { name: 'Story Ideas', icon: SparklesIcon, component: StoryIdeas, path: '/' },
    { name: 'Plot Development', icon: BookOpenIcon, component: PlotDevelopment, path: '/plot' },
    { name: 'Character Creation', icon: UserIcon, component: CharacterCreation, path: '/character' },
    { name: 'Dialogue Generation', icon: ChatBubbleLeftRightIcon, component: DialogueGeneration, path: '/dialogue' },
    { name: 'Text Analysis', icon: DocumentTextIcon, component: TextAnalysis, path: '/analysis' },
  ]

  return (
    <Router>
      <div className="min-h-screen bg-light-100 antialiased font-sans">
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: '!bg-white !text-gray-800',
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1f2937',
              padding: '16px',
              boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07)',
            },
          }}
        />
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-light-400 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-20 px-4 bg-light-200 border-b border-light-400">
              <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">Storytelling<br/>Companion</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-light-400 scrollbar-track-light-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 ease-in-out group"
                >
                  <item.icon className="w-6 h-6 mr-3 transition-colors duration-200" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <main className="w-full px-8 py-8">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="fixed top-4 left-4 z-50 p-2 text-gray-600 bg-white rounded-md hover:bg-light-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-soft"
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-full mx-auto">
              <Routes>
                {navigation.map((item) => (
                  <Route key={item.path} path={item.path} element={<item.component />} />
                ))}
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
