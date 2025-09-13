import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import { AppProvider } from './context/AppContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <MainContent />
        </div>
      </AppProvider>
    </LanguageProvider>
  );
}

export default App;