import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
      <div className="bg-red-900/20 p-6 rounded-full mb-6">
        <AlertTriangle size={64} className="text-red-400" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">{t('not_found')}</h2>
      
      <p className="text-gray-400 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <Link 
        to="/" 
        className="btn btn-primary inline-flex items-center"
      >
        <Home size={18} className="mr-2" />
        {t('back_home')}
      </Link>
    </div>
  );
};

export default NotFound;