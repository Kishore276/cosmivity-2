/**
 * Enhanced Practice Data Structure
 * Provides improved organization and additional features for practice content
 */

export interface EnhancedQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  correctOption: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  tags: string[];
  timeLimit?: number; // in seconds
  points: number;
  category: string;
  subcategory?: string;
  hints?: string[];
  relatedTopics?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  questions: EnhancedQuestion[];
  estimatedTime: number; // in minutes
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prerequisites?: string[];
  learningObjectives: string[];
  tags: string[];
  isLocked: boolean;
  completionCriteria: {
    minimumScore: number;
    timeLimit?: number;
    attemptsAllowed: number;
  };
}

export interface PracticeSubject {
  id: string;
  name: string;
  category: string;
  description: string;
  lessons: PracticeLesson[];
  totalQuestions: number;
  estimatedHours: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prerequisites?: string[];
  learningPath: string[];
  tags: string[];
  icon: string;
  color: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  analytics: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    popularQuestions: string[];
  };
}

export interface UserProgress {
  userId: string;
  subjectId: string;
  lessonId: string;
  questionId: string;
  attempts: number;
  bestScore: number;
  lastAttemptDate: Date;
  timeSpent: number; // in seconds
  isCompleted: boolean;
  mistakes: string[];
  notes?: string;
}

export interface PracticeSession {
  id: string;
  userId: string;
  subjectId: string;
  lessonId?: string;
  type: 'lesson' | 'quiz' | 'mock_test' | 'custom';
  questions: EnhancedQuestion[];
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedAnswers: number;
  responses: {
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
    timeSpent: number;
    hintsUsed: number;
  }[];
  analytics: {
    averageTimePerQuestion: number;
    difficultyBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
    strongAreas: string[];
    weakAreas: string[];
  };
}

export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  subjects: string[];
  targetDate: Date;
  dailyGoal: number; // minutes per day
  weeklyGoal: number; // hours per week
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  progress: {
    completedLessons: string[];
    totalTimeSpent: number;
    averageScore: number;
    milestones: {
      date: Date;
      achievement: string;
      description: string;
    }[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeRoom {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  hostId: string;
  hostName: string;
  participants: RoomParticipant[];
  maxParticipants: number;
  roomKey?: string;
  isActive: boolean;
  currentSession?: {
    subjectId: string;
    lessonId?: string;
    questions: EnhancedQuestion[];
    startTime: Date;
    timeLimit: number;
    currentQuestionIndex: number;
    participantScores: Record<string, number>;
  };
  settings: {
    allowChat: boolean;
    allowHints: boolean;
    showLeaderboard: boolean;
    autoAdvance: boolean;
    timePerQuestion: number;
    difficultyLevel: 'Easy' | 'Medium' | 'Hard' | 'Mixed';
    categories: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomParticipant {
  userId: string;
  userName: string;
  avatarUrl: string;
  isHost: boolean;
  joinedAt: Date;
  isReady: boolean;
  currentScore: number;
  totalAnswered: number;
  correctAnswers: number;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'performance' | 'consistency' | 'social';
  criteria: {
    type: 'score' | 'streak' | 'completion' | 'time' | 'participation';
    value: number;
    condition: 'greater_than' | 'equal_to' | 'less_than';
  };
  reward: {
    points: number;
    badge: string;
    unlocks?: string[];
  };
  isActive: boolean;
  createdAt: Date;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  isCompleted: boolean;
}

// Enhanced practice data with better categorization
export const enhancedPracticeData: PracticeSubject[] = [
  {
    id: 'logical-reasoning',
    name: 'Logical Reasoning',
    category: 'aptitude',
    description: 'Develop analytical thinking and problem-solving skills through logical reasoning questions',
    lessons: [],
    totalQuestions: 0,
    estimatedHours: 15,
    difficulty: 'Medium',
    prerequisites: [],
    learningPath: ['basic-logic', 'pattern-recognition', 'analytical-reasoning', 'critical-thinking'],
    tags: ['logic', 'reasoning', 'patterns', 'analysis'],
    icon: '🧠',
    color: '#3B82F6',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    analytics: {
      totalAttempts: 0,
      averageScore: 0,
      completionRate: 0,
      popularQuestions: []
    }
  },
  {
    id: 'quantitative-aptitude',
    name: 'Quantitative Aptitude',
    category: 'aptitude',
    description: 'Master mathematical concepts and numerical problem-solving techniques',
    lessons: [],
    totalQuestions: 0,
    estimatedHours: 20,
    difficulty: 'Hard',
    prerequisites: ['basic-mathematics'],
    learningPath: ['arithmetic', 'algebra', 'geometry', 'data-interpretation', 'advanced-math'],
    tags: ['mathematics', 'numbers', 'calculations', 'data'],
    icon: '📊',
    color: '#10B981',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    analytics: {
      totalAttempts: 0,
      averageScore: 0,
      completionRate: 0,
      popularQuestions: []
    }
  },
  {
    id: 'verbal-ability',
    name: 'Verbal Ability',
    category: 'aptitude',
    description: 'Enhance language skills, vocabulary, and reading comprehension abilities',
    lessons: [],
    totalQuestions: 0,
    estimatedHours: 12,
    difficulty: 'Easy',
    prerequisites: [],
    learningPath: ['vocabulary', 'grammar', 'reading-comprehension', 'verbal-reasoning'],
    tags: ['language', 'vocabulary', 'grammar', 'comprehension'],
    icon: '📚',
    color: '#8B5CF6',
    isActive: true,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    analytics: {
      totalAttempts: 0,
      averageScore: 0,
      completionRate: 0,
      popularQuestions: []
    }
  }
];

// Default achievements
export const defaultAchievements: Achievement[] = [
  {
    id: 'first-lesson',
    name: 'Getting Started',
    description: 'Complete your first lesson',
    icon: '🎯',
    category: 'progress',
    criteria: { type: 'completion', value: 1, condition: 'greater_than' },
    reward: { points: 10, badge: 'starter' },
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'perfect-score',
    name: 'Perfect Score',
    description: 'Score 100% on any lesson',
    icon: '⭐',
    category: 'performance',
    criteria: { type: 'score', value: 100, condition: 'equal_to' },
    reward: { points: 50, badge: 'perfectionist' },
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'week-streak',
    name: 'Consistent Learner',
    description: 'Practice for 7 consecutive days',
    icon: '🔥',
    category: 'consistency',
    criteria: { type: 'streak', value: 7, condition: 'greater_than' },
    reward: { points: 100, badge: 'consistent' },
    isActive: true,
    createdAt: new Date()
  }
];
