import React from 'react';
import { useTranslation } from 'react-i18next';
import { Github, Globe, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-800 border-t border-gray-700 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Shield size={20} className="text-green-500 mr-2" />
            <span className="text-gray-300">HackEd © {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors flex items-center"
              aria-label="GitHub"
            >
              <Github size={18} className="mr-1" />
              <span>GitHub</span>
            </a>
            
            <a 
              href="#" 
              className="text-gray-400 hover:text-white transition-colors flex items-center"
              aria-label="Website"
            >
              <Globe size={18} className="mr-1" />
              <span>Website</span>
            </a>
          </div>
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>
            This project is for educational purposes only. Practice ethical hacking responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;