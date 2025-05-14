import { UserProgress } from '../types';

// Initial empty progress state
const initialUserProgress: UserProgress = {
  completedChallenges: [],
  courseProgress: {},
  hintsUsed: {}
};

// Key for localStorage
const STORAGE_KEY = 'ethical-hacking-progress';

// Load user progress from localStorage
export const loadUserProgress = (): UserProgress => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) return { ...initialUserProgress };
    
    return JSON.parse(storedData) as UserProgress;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return { ...initialUserProgress };
  }
};

// Save user progress to localStorage
export const saveUserProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
};

// Mark a challenge as completed
export const completeChallenge = (challengeId: string): void => {
  const progress = loadUserProgress();
  
  if (!progress.completedChallenges.includes(challengeId)) {
    progress.completedChallenges.push(challengeId);
    saveUserProgress(progress);
  }
};

// Check if a challenge is completed
export const isChallengeCompleted = (challengeId: string): boolean => {
  const progress = loadUserProgress();
  return progress.completedChallenges.includes(challengeId);
};

// Use a hint for a challenge
export const useHint = (challengeId: string): number => {
  const progress = loadUserProgress();
  
  const currentHints = progress.hintsUsed[challengeId] || 0;
  progress.hintsUsed[challengeId] = currentHints + 1;
  
  saveUserProgress(progress);
  return progress.hintsUsed[challengeId];
};

// Get number of hints used for a challenge
export const getHintsUsed = (challengeId: string): number => {
  const progress = loadUserProgress();
  return progress.hintsUsed[challengeId] || 0;
};

// Mark a course module as completed
export const completeModule = (courseId: string, moduleIndex: number): void => {
  const progress = loadUserProgress();
  
  if (!progress.courseProgress[courseId]) {
    progress.courseProgress[courseId] = [];
  }
  
  if (!progress.courseProgress[courseId].includes(moduleIndex)) {
    progress.courseProgress[courseId].push(moduleIndex);
    progress.courseProgress[courseId].sort((a, b) => a - b); // Keep indices sorted
    saveUserProgress(progress);
  }
};

// Get the last completed module for a course
export const getLastCompletedModule = (courseId: string): number => {
  const progress = loadUserProgress();
  
  if (!progress.courseProgress[courseId] || progress.courseProgress[courseId].length === 0) {
    return -1; // No modules completed
  }
  
  return Math.max(...progress.courseProgress[courseId]);
};

// Check if a module is completed
export const isModuleCompleted = (courseId: string, moduleIndex: number): boolean => {
  const progress = loadUserProgress();
  
  if (!progress.courseProgress[courseId]) {
    return false;
  }
  
  return progress.courseProgress[courseId].includes(moduleIndex);
};

// Reset all progress (for settings page)
export const resetProgress = (): void => {
  saveUserProgress({ ...initialUserProgress });
};