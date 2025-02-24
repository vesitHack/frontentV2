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
        <p className="text-gray-300 dark:text-gray-300 mb-8">
          Practice your dialogue writing with AI-powered conversation
        </p>

        <div className="card p-8 mb-8 text-left relative">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
            Dialogue Assistance - How to Use This Feature
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-primary-600 dark:text-primary-400">
                📌 What This Feature Does
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  Generates character-specific dialogues based on personality and scene context
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  Ensures tone consistency throughout the story
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  Suggests multiple variations of a conversation for creative flexibility
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✅</span>
                  Enhances engagement with natural and expressive dialogues
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-primary-600 dark:text-primary-400">
                🛠 How to Use It?
              </h4>
              <ol className="space-y-2 text-gray-700 dark:text-gray-300 list-decimal list-inside">
                <li>Click on the "Start Call" button at the bottom right corner of the page to interact with our AI assistant</li>
                <li>Provide character details (name, personality traits, speaking style)</li>
                <li>Describe the scene (context, mood, and emotions)</li>
                <li>Receive AI-generated dialogues that fit your characters</li>
                <li>Customize and refine the generated conversations as needed</li>
              </ol>
            </div>

            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
              <p className="text-primary-800 dark:text-primary-200">
                💡 <span className="font-semibold">Tip:</span> If you need variations, ask the AI to generate alternative dialogue styles or refine the tone!
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-3 text-primary-600 dark:text-primary-400">
                🎯 Example Use Cases
              </h4>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• Crafting intense dramatic confrontations between characters</li>
                <li>• Creating humorous or witty exchanges to add depth to storytelling</li>
                <li>• Developing emotionally rich dialogues for deep character interactions</li>
                <li>• Ensuring character consistency in different story situations</li>
              </ul>
            </div>

            <div className="text-center mt-8">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                🚀 Start Now! Let our AI bring your characters to life with engaging dialogues! 🎭
              </p>
            </div>
          </div>

          {/* Chat Widget positioned absolutely in bottom right */}
          <div className="absolute bottom-4 right-4 w-[350px]">
            <elevenlabs-convai 
              agent-id="oJh7sCkY34nPaY4qImZF"
              className="w-full"
            ></elevenlabs-convai>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat; 