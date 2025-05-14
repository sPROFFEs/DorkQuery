import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, LockKeyhole } from 'lucide-react';
import { getCourse } from '../data/courses';
import { completeModule, isModuleCompleted } from '../utils/storage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CodeEditor from '../components/CodeEditor';

const Course: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const course = getCourse(id || '');
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  
  useEffect(() => {
    if (!course) {
      navigate('/courses');
      return;
    }
    
    // Get completed modules
    const completed = course.modules.map((_, index) => 
      isModuleCompleted(course.id, index) ? index : -1
    ).filter(index => index !== -1);
    
    setCompletedModules(completed);
    
    // If user has started the course before, go to the next uncompleted module
    if (completed.length > 0 && completed.length < course.modules.length) {
      const lastCompleted = Math.max(...completed);
      const nextModule = lastCompleted + 1;
      if (nextModule < course.modules.length) {
        setCurrentModuleIndex(nextModule);
      }
    }
  }, [course, navigate]);
  
  if (!course) {
    return null;
  }
  
  const currentModule = course.modules[currentModuleIndex];
  const isLastModule = currentModuleIndex === course.modules.length - 1;
  const isFirstModule = currentModuleIndex === 0;
  const isModuleComplete = completedModules.includes(currentModuleIndex);
  
  const handleNext = () => {
    if (isLastModule) return;
    setCurrentModuleIndex(prev => prev + 1);
  };
  
  const handlePrevious = () => {
    if (isFirstModule) return;
    setCurrentModuleIndex(prev => prev - 1);
  };
  
  const handleModuleCompletion = () => {
    completeModule(course.id, currentModuleIndex);
    
    if (!completedModules.includes(currentModuleIndex)) {
      setCompletedModules([...completedModules, currentModuleIndex]);
    }
  };
  
  return (
    <div className="fade-in">
      <div className="mb-6">
        <Link to="/courses" className="inline-flex items-center text-gray-400 hover:text-white mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Courses
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-400 mb-4">{course.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="badge badge-purple">
            <BookOpen size={16} className="mr-1" />
            {t(`courses.categories.${course.category}`)}
          </span>
          
          <span className="badge badge-blue">
            <LockKeyhole size={16} className="mr-1" />
            {t(`ctf.difficulty.${course.difficulty}`)}
          </span>
          
          <span className="badge badge-green">
            <CheckCircle size={16} className="mr-1" />
            {completedModules.length}/{course.modules.length} {t('courses.module', { count: course.modules.length })}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden sticky top-24">
            <div className="p-4 bg-gray-700">
              <h3 className="font-bold">Course Modules</h3>
            </div>
            <div className="p-2">
              {course.modules.map((module, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-3 rounded-md mb-1 flex items-center transition-colors ${
                    index === currentModuleIndex
                      ? 'bg-purple-900/40 text-purple-300'
                      : 'hover:bg-gray-700'
                  }`}
                  onClick={() => setCurrentModuleIndex(index)}
                >
                  <div className="mr-3 flex-shrink-0">
                    {completedModules.includes(index) ? (
                      <CheckCircle size={18} className="text-green-500" />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-500" />
                    )}
                  </div>
                  <span className="text-sm line-clamp-1">{module.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6">{currentModule.title}</h2>
            
            <MarkdownRenderer content={currentModule.content} />
            
            {currentModule.codeSnippet && (
              <div className="mt-8">
                <CodeEditor
                  initialCode={currentModule.codeSnippet}
                  language={currentModule.language}
                  validation={currentModule.validation}
                  solution={currentModule.solution}
                  onCodeValidated={handleModuleCompletion}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={isFirstModule}
              className={`btn inline-flex items-center ${
                isFirstModule ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'btn-outline'
              }`}
            >
              <ArrowLeft size={16} className="mr-2" />
              {t('courses.prev')}
            </button>
            
            {isLastModule && completedModules.length === course.modules.length ? (
              <div className="text-center px-4 py-2 bg-green-900/30 border border-green-500 rounded-md text-green-400">
                {t('courses.complete_message')}
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLastModule}
                className={`btn inline-flex items-center ${
                  isLastModule ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'btn-primary'
                }`}
              >
                {t('courses.next')}
                <ArrowRight size={16} className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Course;