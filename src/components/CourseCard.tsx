import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, CheckCircle, LockKeyhole } from 'lucide-react';
import { Course } from '../types';
import { getLastCompletedModule } from '../utils/storage';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const { t } = useTranslation();
  const lastCompletedModule = getLastCompletedModule(course.id);
  const isCompleted = lastCompletedModule === course.modules.length - 1;
  const isStarted = lastCompletedModule >= 0;
  
  // Get category and difficulty translation keys
  const getCategoryKey = (category: string) => `courses.categories.${category}`;
  const getDifficultyKey = (difficulty: string) => `ctf.difficulty.${difficulty}`;
  
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
    <Link to={`/courses/${course.id}`} className="card">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-gray-200">{course.title}</h3>
          {isCompleted && (
            <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge ${getDifficultyColor(course.difficulty)}`}>
            <LockKeyhole size={14} className="mr-1" />
            {t(getDifficultyKey(course.difficulty))}
          </span>
          
          <span className="badge badge-purple">
            <BookOpen size={14} className="mr-1" />
            {t(getCategoryKey(course.category))}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300 text-sm">
            {t('courses.module', { count: course.modules.length })}: <span className="font-bold text-green-400">{course.modules.length}</span>
          </span>
          
          <span className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs px-3 py-1 rounded transition-colors">
            {isCompleted 
              ? t('courses.completed') 
              : isStarted 
                ? t('courses.continue') 
                : t('courses.start')}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;