export function Documentation() {
  return (
    <div className="p-6 space-y-8">
      <section id="installation" className="space-y-4">
        <h2 className="text-2xl font-bold dark:text-white">Installing Tampermonkey</h2>
        <div className="space-y-4">
          <p className="dark:text-gray-300">
            Tampermonkey is a popular userscript manager that allows you to customize websites with JavaScript.
          </p>
          <div className="flex border rounded-lg h-64 gap-2">
            <img src="Screenshot 2024-12-09 011639.png" alt="Browser extension installation" className="w-1/2 object-cover" />
            <img src="Screenshot 2024-12-09 011834.png" alt="Browser extension installation" className="w-1/2 object-cover" />
          </div>
          <ol className="list-decimal list-inside space-y-2 dark:text-gray-300">
            <li>Open your browser's extension store</li>
            <li>Search for "Tampermonkey"</li>
            <li>Click "Add to Browser" or "Install"</li>
            <li>Follow the installation prompts</li>
          </ol>
        </div>
      </section>

      <section id="adding-scripts" className="space-y-4">
        <h2 className="text-2xl font-bold dark:text-white">Adding Scripts</h2>
        <div className="space-y-4">
          <p className="dark:text-gray-300">
            Once Tampermonkey is installed, you can easily add new userscripts.
          </p>
          <div className="flex border rounded-lg h-64 gap-2">
            <img src="Screenshot 2024-12-09 012106.png" alt="Code editor with JavaScript" className="w-1/2 object-cover" />
            <img src="Screenshot 2024-12-09 012300.png" alt="Code editor with JavaScript" className="w-1/2 object-cover" />
          </div>
          <ol className="list-decimal list-inside space-y-2 dark:text-gray-300">
            <li>Click the Tampermonkey icon in your browser</li>
            <li>Select "Create a new script"</li>
            <li>Paste your userscript code</li>
            <li>Click File &gt; Save or press Ctrl+S</li>
          </ol>
        </div>
      </section>

      <section id="configuration" className="space-y-4">
        <h2 className="text-2xl font-bold dark:text-white">Configuration</h2>
        <div className="space-y-4">
          <p className="dark:text-gray-300">
            Configure your userscript to run only on YouTube, and if YouTube is already open, reload the page for the script to take effect.
          </p>
          <div className="flex border rounded-lg h-64 gap-2">
            <img src="Screenshot 2024-12-09 012627.png" alt="Configuration settings" className="w-1/2 object-cover" />
            <img src="Screenshot 2024-12-09 014811.png" alt="Configuration settings" className="w-1/2 object-cover" />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <pre className="text-sm dark:text-gray-300">
              {`// ==UserScript==
// @name         YouTube Content Personalization
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Track YouTube video data and manipulate it
// @match        https://www.youtube.com/*
// @grant        none
// ==/UserScript==

(function() {...})();`}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}