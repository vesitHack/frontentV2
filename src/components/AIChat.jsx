import { useEffect } from 'react';

const AIChat = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/convai-widget/index.js';
    script.async = true;
    script.type = 'text/javascript';
    
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-8 text-center animate-fade-in">
        <h2 className="text-3xl font-bold text-gray-100 dark:text-gray-100 mb-2">
          Dialogue Practice
        </h2>
        <p className="text-gray-300 dark:text-gray-300">
          Practice your dialogue writing with AI-powered conversation
        </p>
      </div>

      <div className="card animate-slide-in overflow-hidden">
        <div className="ai-chat-container min-h-[600px] relative">
          <elevenlabs-convai 
            agent-id="oJh7sCkY34nPaY4qImZF"
            className="w-full h-full"
          ></elevenlabs-convai>
        </div>
      </div>
    </div>
  );
};

export default AIChat; 