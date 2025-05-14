import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, LockKeyhole, Shield } from 'lucide-react';
import { Challenge } from '../types';
import { isChallengeCompleted } from '../utils/storage';

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const { t } = useTranslation();
  const isCompleted = isChallengeCompleted(challenge.id);
  
  // Get category and difficulty translation keys
  const getCategoryKey = (category: string) => `ctf.categories.${category}`;
  const getDifficultyKey = (difficulty: string) => `ctf.difficulty.${difficulty}`;
  
  // Get appropriate icon for the category
  const getCategoryIcon = () => {
    return <Shield className="mr-1" size={16} />;
  };
  
  // Get appropriate color for the difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'badge-green';
      case 'intermediate':
        return 'badge-blue';
      case 'advanced':
        return 'badge-red';
      default:
        return 'badge-green';
    }
  };
  
  return (
    <Link to={`/ctf/${challenge.id}`} className="card">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-200">{challenge.title}</h3>
          {isCompleted && (
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{challenge.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge ${getDifficultyColor(challenge.difficulty)}`}>
            <LockKeyhole size={14} className="mr-1" />
            {t(getDifficultyKey(challenge.difficulty))}
          </span>
          
          <span className="badge badge-purple">
            {getCategoryIcon()}
            {t(getCategoryKey(challenge.category))}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">
            {t('ctf.challenge.points')}: <span className="font-bold text-green-400">{challenge.points}</span>
          </span>
          
          <span className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs px-3 py-1 rounded transition-colors">
            {isCompleted ? t('ctf.challenge.solved') : 'Solve →'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ChallengeCard;