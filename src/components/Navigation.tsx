import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Terminal, BookOpen, Home, Menu, X } from 'lucide-react';

interface NavigationProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { t } = useTranslation();
  
  return (
    <nav className="flex items-center">
      {/* Mobile menu button */}
      <button 
        className="md:hidden mr-4 text-gray-300 hover:text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Logo */}
      <NavLink to="/" className="flex items-center text-green-500 font-bold text-xl mr-8">
        <Terminal className="mr-2" />
        <span>HackEd</span>
      </NavLink>
      
      {/* Desktop navigation */}
      <div className="hidden md:flex space-x-6">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex items-center px-2 py-1 rounded transition-colors ${isActive ? 'text-green-400 bg-gray-700' : 'text-gray-300 hover:text-white'}`
          }
        >
          <Home size={18} className="mr-1" />
          <span>{t('nav.home')}</span>
        </NavLink>
        
        <NavLink 
          to="/ctf" 
          className={({ isActive }) => 
            `flex items-center px-2 py-1 rounded transition-colors ${isActive ? 'text-green-400 bg-gray-700' : 'text-gray-300 hover:text-white'}`
          }
        >
          <Terminal size={18} className="mr-1" />
          <span>{t('nav.ctf')}</span>
        </NavLink>
        
        <NavLink 
          to="/courses" 
          className={({ isActive }) => 
            `flex items-center px-2 py-1 rounded transition-colors ${isActive ? 'text-green-400 bg-gray-700' : 'text-gray-300 hover:text-white'}`
          }
        >
          <BookOpen size={18} className="mr-1" />
          <span>{t('nav.courses')}</span>
        </NavLink>
      </div>
      
      {/* Mobile navigation */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center text-green-500 font-bold text-xl">
                <Terminal className="mr-2" />
                <span>HackEd</span>
              </div>
              <button 
                className="text-gray-300 hover:text-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-3">
              <NavLink 
                to="/"
                className={({ isActive }) => 
                  `flex items-center px-2 py-2 rounded transition-colors ${isActive ? 'text-green-400 bg-gray-700' : 'text-gray-300 hover:text-white'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Home size={18} className="mr-2" />
                <span>{t('nav.home')}</span>
              </NavLink>
              
              <NavLink 
                to="/ctf"
                className={({ isActive }) => 
                  `flex items-center px-2 py-2 rounded transition-colors ${isActive ? 'text-green-400 bg-gray-700' : 'text-gray-300 hover:text-white'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Terminal size={18} className="mr-2" />
                <span>{t('nav.ctf')}</span>
              </NavLink>
              
              <NavLink 
                to="/courses"
                className={({ isActive }) => 
                  `flex items-center px-2 py-2 rounded transition-colors ${isActive ? 'text-green-400 bg-gray-700' : 'text-gray-300 hover:text-white'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <BookOpen size={18} className="mr-2" />
                <span>{t('nav.courses')}</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;