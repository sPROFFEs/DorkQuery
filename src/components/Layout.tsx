import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import LanguageSwitcher from './LanguageSwitcher';
import Footer from './Footer';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Navigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <LanguageSwitcher />
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;