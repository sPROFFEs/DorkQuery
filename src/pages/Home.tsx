import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Terminal, BookOpen, Cpu, Globe } from 'lucide-react';

const Home: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="fade-in">
      <section className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          {t('home.title')}
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          {t('home.subtitle')}
        </p>
      </section>
      
      <section className="grid md:grid-cols-2 gap-8 mb-16">
        <Link to="/ctf" className="card p-6 hover:scale-[1.02] transition-transform duration-300">
          <div className="mb-4 bg-gradient-to-r from-green-900/40 to-green-700/40 p-4 rounded-full w-16 h-16 flex items-center justify-center">
            <Terminal size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('home.ctf_card.title')}</h2>
          <p className="text-gray-400 mb-4">{t('home.ctf_card.description')}</p>
          <button className="btn btn-primary">{t('home.ctf_card.button')}</button>
        </Link>
        
        <Link to="/courses" className="card p-6 hover:scale-[1.02] transition-transform duration-300">
          <div className="mb-4 bg-gradient-to-r from-purple-900/40 to-purple-700/40 p-4 rounded-full w-16 h-16 flex items-center justify-center">
            <BookOpen size={32} className="text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('home.courses_card.title')}</h2>
          <p className="text-gray-400 mb-4">{t('home.courses_card.description')}</p>
          <button className="btn btn-secondary">{t('home.courses_card.button')}</button>
        </Link>
      </section>
      
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('home.features.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex flex-col items-center text-center">
            <Cpu size={32} className="text-cyan-400 mb-3" />
            <h3 className="font-bold mb-2">{t('home.features.offline')}</h3>
            <p className="text-gray-400 text-sm">No backend required. Run locally with zero configuration.</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex flex-col items-center text-center">
            <Terminal size={32} className="text-green-400 mb-3" />
            <h3 className="font-bold mb-2">{t('home.features.interactive')}</h3>
            <p className="text-gray-400 text-sm">Write and execute code right in your browser.</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex flex-col items-center text-center">
            <BookOpen size={32} className="text-purple-400 mb-3" />
            <h3 className="font-bold mb-2">{t('home.features.progress')}</h3>
            <p className="text-gray-400 text-sm">Your progress is automatically saved in your browser.</p>
          </div>
          
          <div className="bg-gray-800 p-5 rounded-lg border border-gray-700 flex flex-col items-center text-center">
            <Globe size={32} className="text-blue-400 mb-3" />
            <h3 className="font-bold mb-2">{t('home.features.multilingual')}</h3>
            <p className="text-gray-400 text-sm">Content is automatically translated to your language.</p>
          </div>
        </div>
      </section>
      
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-lg border border-gray-700">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to start hacking?</h2>
          <p className="text-gray-400 mb-6">Choose your path and begin your ethical hacking journey today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ctf" className="btn btn-primary">
              Start CTF Challenges
            </Link>
            <Link to="/courses" className="btn btn-secondary">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;