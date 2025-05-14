import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCourses } from '../data/courses';
import CourseCard from '../components/CourseCard';
import { Search, BookOpen, Filter } from 'lucide-react';

const CoursesHub: React.FC = () => {
  const { t } = useTranslation();
  const courses = getCourses();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  // Filter courses based on search term and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = !difficultyFilter || course.difficulty === difficultyFilter;
    const matchesCategory = !categoryFilter || course.category === categoryFilter;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });
  
  return (
    <div className="fade-in">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('courses.title')}</h1>
        <p className="text-gray-400">{t('courses.subtitle')}</p>
      </section>
      
      <section className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              className="bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <select
                className="bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="bg-gray-800 border border-gray-700 rounded-md py-2 pl-10 pr-4 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={categoryFilter || ''}
                onChange={(e) => setCategoryFilter(e.target.value || null)}
              >
                <option value="">All Categories</option>
                <option value="web">{t('courses.categories.web')}</option>
                <option value="network">{t('courses.categories.network')}</option>
                <option value="crypto">{t('courses.categories.crypto')}</option>
                <option value="malware">{t('courses.categories.malware')}</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen size={18} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section>
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No courses match your filters. Try adjusting your search criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CoursesHub;