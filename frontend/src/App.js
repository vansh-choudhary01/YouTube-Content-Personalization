import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import { Documentation } from './components/Documentation.tsx';
import { useTheme } from './hooks/useTheme.ts';
import { useActiveSection } from './hooks/useActiveSection.ts';
import UserInterestSelector from "./pages/UserInterestSelector.jsx";
import "./App.css"

function App() {
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const activeSection = useActiveSection(showDocumentation);

  return (<>
    <button className={`fixed z-10 bottom-0 ${isDark ? 'bg-blue-800' : 'bg-blue-200'} rounded p-2 ${isDark ? 'text-white': 'text-blue-700'}`} onClick={() => setShowDocumentation(prev => !prev)}>{showDocumentation ? 'Back to Home' : 'Documentation'}</button>
    <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
    {showDocumentation ? <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar
        isOpen={isSidebarOpen}
        activeSection={activeSection}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className={`transition-all duration-300 ${
        // isSidebarOpen ? 'lg:ml-64' : ''
        'lg:ml-64'
        }`}>
        <Documentation />
      </main>
    </div> : <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${isDark ? 'text-white': 'text-black'}`}>
      <UserInterestSelector />
    </div>}
  </>);
}

export default App;