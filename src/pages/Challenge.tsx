import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Award, LockKeyhole, Shield, Clock, Lightbulb } from 'lucide-react';
import { getChallenge } from '../data/challenges';
import { validateFlag } from '../utils/validation';
import { completeChallenge, isChallengeCompleted, useHint, getHintsUsed } from '../utils/storage';

const Challenge: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const challenge = getChallenge(id || '');
  const [flag, setFlag] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);
  
  useEffect(() => {
    if (!challenge) {
      navigate('/ctf');
      return;
    }
    
    setCompleted(isChallengeCompleted(challenge.id));
    setHintsUsed(getHintsUsed(challenge.id));
    
    // Pre-reveal hints that have been used
    const usedHints = getHintsUsed(challenge.id);
    const revealed = Array.from({ length: usedHints }, (_, i) => i);
    setRevealedHints(revealed);
  }, [challenge, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challenge) return;
    
    const isCorrect = validateFlag(flag, challenge.flag);
    
    if (isCorrect) {
      setResult({ success: true, message: t('ctf.challenge.correct') });
      completeChallenge(challenge.id);
      setCompleted(true);
    } else {
      setResult({ success: false, message: t('ctf.challenge.incorrect') });
    }
  };
  
  const handleUseHint = (index: number) => {
    if (!challenge) return;
    
    const newHintsUsed = useHint(challenge.id);
    setHintsUsed(newHintsUsed);
    
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
    }
  };
  
  if (!challenge) {
    return null; // Navigate will redirect
  }
  
  return (
    <div className="fade-in">
      <div className="mb-6">
        <Link to="/ctf" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Challenges
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
        <p className="text-gray-400 mb-4">{challenge.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="badge badge-purple">
            <Shield size={16} className="mr-1" />
            {t(`ctf.categories.${challenge.category}`)}
          </span>
          
          <span className="badge badge-blue">
            <LockKeyhole size={16} className="mr-1" />
            {t(`ctf.difficulty.${challenge.difficulty}`)}
          </span>
          
          <span className="badge badge-green">
            <Award size={16} className="mr-1" />
            {t('ctf.challenge.points')}: {challenge.points}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <div dangerouslySetInnerHTML={{ __html: challenge.content }} />
          </div>
          
          {!completed && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 transition-all duration-300 hover:border-green-500">
              <h3 className="text-xl font-bold mb-4">Submit Flag</h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="flag" className="block text-gray-400 mb-2">
                    {t('ctf.challenge.flag_placeholder')}
                  </label>
                  <input
                    type="text"
                    id="flag"
                    className="flag-input"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="FLAG{...}"
                  />
                </div>
                
                <button type="submit" className="btn btn-primary">
                  {t('ctf.challenge.submit')}
                </button>
                
                {result && (
                  <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                    {result.message}
                  </div>
                )}
              </form>
            </div>
          )}
          
          {completed && (
            <div className="bg-green-900/20 border border-green-600 rounded-lg p-6 text-center">
              <Award size={48} className="text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-400 mb-2">Challenge Completed!</h3>
              <p className="text-gray-300">
                You've successfully solved this challenge. Ready for the next one?
              </p>
              <Link to="/ctf" className="btn btn-primary mt-4">
                Back to Challenges
              </Link>
            </div>
          )}
        </div>
        
        <div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Hints</h3>
            
            {challenge.hints.map((hint, index) => (
              <div key={index} className="mb-4 last:mb-0">
                {revealedHints.includes(index) ? (
                  <div className="p-3 bg-gray-700 rounded">
                    <p className="text-gray-300">{hint}</p>
                  </div>
                ) : (
                  <button
                    className="w-full p-3 border border-gray-600 rounded flex justify-between items-center hover:border-yellow-500 hover:bg-gray-700 transition-colors"
                    onClick={() => handleUseHint(index)}
                  >
                    <span className="flex items-center">
                      <Lightbulb size={16} className="text-yellow-500 mr-2" />
                      Hint {index + 1}
                    </span>
                    <span className="text-gray-500 text-sm">Click to reveal</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4">Challenge Info</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status:</span>
                <span className={`font-medium ${completed ? 'text-green-400' : 'text-yellow-400'}`}>
                  {completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Difficulty:</span>
                <span className="font-medium text-blue-400">
                  {t(`ctf.difficulty.${challenge.difficulty}`)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Category:</span>
                <span className="font-medium text-purple-400">
                  {t(`ctf.categories.${challenge.category}`)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Points:</span>
                <span className="font-medium text-green-400">{challenge.points}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hints Used:</span>
                <span className="font-medium text-yellow-400">{hintsUsed}/{challenge.hints.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;