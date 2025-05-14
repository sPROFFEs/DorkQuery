// Challenge types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'web' | 'crypto' | 'forensics' | 'reverse';
  points: number;
  hints: string[];
  flag: string;
  content: string;
}

// Course types
export interface CourseModule {
  id: string;
  title: string;
  content: string;
  codeSnippet?: string;
  language: 'javascript' | 'html' | 'sql';
  solution?: string;
  validation?: string; // JavaScript function as string to validate user's code
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'web' | 'network' | 'crypto' | 'malware';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  modules: CourseModule[];
}

// User progress types
export interface UserProgress {
  completedChallenges: string[]; // challenge IDs
  courseProgress: Record<string, number[]>; // courseId -> completed module indices
  hintsUsed: Record<string, number>; // challengeId -> number of hints used
}