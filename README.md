# Storytelling Companion

An AI-powered writing assistant that helps authors develop stories, characters, and dialogues using Google's Gemini AI.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment:
   - No environment variables are needed for the frontend
   - Make sure the backend is running at `http://localhost:8000`

3. Start development server:
```bash
npm run dev
```

## Features

- **Story Idea Generation**: Get creative story ideas based on your premises and themes
- **Plot Development**: Structure your story with detailed plot outlines
- **Character Creation**: Design deep, memorable characters with rich backgrounds
- **Dialogue Generation**: Create natural, character-driven dialogues
- **Text Analysis**: Get professional feedback on your writing

## Styling

- Built with Tailwind CSS for modern, responsive design
- Dark theme optimized for long writing sessions
- Custom scrollbars and animations
- Mobile-responsive layout

## Architecture

- React components in `src/components/`
- API services in `src/services/`
- Uses React Router for navigation
- Axios for API communication
- React Hot Toast for notifications

## Dependencies

### Production
- React 18
- React Router DOM
- Axios
- React Hot Toast
- Hero Icons
- Headless UI

### Development
- Vite
- Tailwind CSS
- PostCSS
- ESLint
- TypeScript types

## Development

Make sure to have both backend and frontend running:

1. Backend: `http://localhost:8000`
2. Frontend: `http://localhost:3000`

## Building for Production

```bash
npm run build
npm run preview
