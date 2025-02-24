import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import {
  BookOpenIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  SparklesIcon,
  MoonIcon,
  SunIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  BeakerIcon,
  VideoCameraIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline'

// Components
import StoryIdeas from './components/StoryIdeas'
import StoryGenerator from './components/StoryGenerator'
import PlotDevelopment from './components/PlotDevelopment'
import CharacterCreation from './components/CharacterCreation'
import DialogueGeneration from './components/DialogueGeneration'
import TextAnalysis from './components/TextAnalysis'
import AIChat from './components/AIChat'
import CharacterDevelopment from './components/CharacterDevelopment'
import ShortVideoGenerator from './components/ShortVideoGenerator'
import DialogueDelivery from './components/DialogueDelivery'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const navigation = [
    { name: 'Story Generator', icon: BeakerIcon, component: StoryGenerator, path: '/' },
    { name: 'Character Development', icon: UserIcon, component: CharacterDevelopment, path: '/characters' },
    { name: 'Short Video Story Generator', icon: VideoCameraIcon, component: ShortVideoGenerator, path: '/shorts' },
    { name: 'Dialogue Delivery', icon: ChatBubbleBottomCenterTextIcon, component: DialogueDelivery, path: '/dialogue' },
    { name: 'Voice Dialogue Trainer Agent', icon: ChatBubbleOvalLeftEllipsisIcon, component: AIChat, path: '/practice' },
    { name: 'Story Ideas', icon: SparklesIcon, component: StoryIdeas, path: '/story-ideas' },
    { name: 'Plot Development', icon: BookOpenIcon, component: PlotDevelopment, path: '/plot' },
    { name: 'Text Analysis', icon: DocumentTextIcon, component: TextAnalysis, path: '/analysis' },
  ]

  return (
    <Router>
      <div className={`min-h-screen antialiased font-sans relative ${isDarkMode ? 'dark' : ''}`}>
        <Toaster 
          position="top-right" 
          toastOptions={{
            className: `${isDarkMode ? '!bg-gray-800 !text-gray-100' : '!bg-white !text-gray-800'}`,
            duration: 3000,
            style: {
              padding: '16px',
              boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.15)',
            },
          }}
        />
        
        {/* Sidebar - Remove backdrop-blur */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isDarkMode ? 'bg-gray-900 border-r border-gray-700' : 'bg-white border-r border-gray-200'}`}>
          <div className="flex flex-col h-full">
            <div className={`flex items-center justify-center h-20 px-4 border-b
              ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h1 className={`text-xl font-bold whitespace-nowrap 
                ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Storytelling<br/>Companion
              </h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ease-in-out group ${
                    isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-primary-400' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3 transition-colors duration-200" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Theme Toggle Button - Updated styling */}
            <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={toggleTheme}
                className={`flex items-center justify-center w-full px-4 py-2 rounded-lg transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? (
                  <>
                    <SunIcon className="w-5 h-5 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <MoonIcon className="w-5 h-5 mr-2" />
                    Dark Mode
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
          <main className="w-full p-8">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`fixed top-4 left-4 z-50 p-2 rounded-lg transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-primary-500 card
                ${isDarkMode ? 'text-gray-300 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-100/50'}`}
              aria-label="Toggle Sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-full max-w-5xl mx-auto relative z-10">
              <Routes>
                {navigation.map((item) => (
                  <Route key={item.path} path={item.path} element={<item.component />} />
                ))}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  )
}

export default App
