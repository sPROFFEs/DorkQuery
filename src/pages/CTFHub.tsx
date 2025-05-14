import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getChallenges } from '../data/challenges';
import ChallengeCard from '../components/ChallengeCard';
import { Search, Shield, Filter } from 'lucide-react';

const CTFHub: React.FC = () => {
  const { t } = useTranslation();
  const challenges = getChallenges();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Filter challenges based on search term and filters
  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = 
      challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = !difficultyFilter || challenge.difficulty === difficultyFilter;
    const matchesCategory = !categoryFilter || challenge.category === categoryFilter;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });
  
  return (
    <div className="fade-in">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('ctf.title')}</h1>
        <p className="text-gray-400">{t('ctf.subtitle')}</p>
      </section>
      
      <section className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <select
                className="bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={difficultyFilter || ''}
                onChange={(e) => setDifficultyFilter(e.target.value || null)}
              >
                <option value="">All Difficulties</option>
                <option value="beginner">{t('ctf.difficulty.beginner')}</option>
                <option value="intermediate">{t('ctf.difficulty.intermediate')}</option>
                <option value="advanced">{t('ctf.difficulty.advanced')}</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter size={18} className="text-gray-500" />
              </div>
            </div>
            
            <div className="relative">
              <select
                className="bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
              >
                <option value="">All Categories</option>
                <option value="web">{t('ctf.categories.web')}</option>
                <option value="crypto">{t('ctf.categories.crypto')}</option>
                <option value="forensics">{t('ctf.categories.forensics')}</option>
                <option value="reverse">{t('ctf.categories.reverse')}</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Shield size={18} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section>
        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No challenges match your filters. Try adjusting your search criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CTFHub;