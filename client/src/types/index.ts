export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  college?: string;
  department?: string;
  semester?: number;
  avatar?: string;
  streak: number;
  study_hours?: number;
  studyHours?: number;
  last_active_date?: string | null;
  created_at?: string;
}

export interface DocumentItem {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  file_name: string;
  file_type: string;
  file_size: number;
  content?: string;
  subject: string;
  tags: string[];
  created_at: string;
  updated_at?: string;
}

export interface Flashcard {
  id: string;
  _id?: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  subject: string;
  bookmarked: boolean;
  learned: boolean;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  type: 'mcq' | 'truefalse' | 'short';
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: string;
  _id?: string;
  title: string;
  subject: string;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  _id?: string;

  quiz_id: string;

  quiz?: {
    id?: string;
    _id?: string;
    title: string;
    subject: string;
  };

  score: number;
  total_questions: number;
  percentage: number;
  time_taken: number;

  answers: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];

  created_at: string;
}

export interface DayPlan {
  day: string;
  date?: string;
  topics: string[];
  hours: number;
  activities: string[];
  isRevision?: boolean;
}

export interface StudyPlan {
  id: string;
  _id?: string;

  title: string;
  subjects: string[];
  available_hours_per_day: number;
  exam_date: string;
  weak_topics: string[];

  daily_plan: DayPlan[];
  weekly_plan: DayPlan[];
  revision_schedule: DayPlan[];

  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  _id?: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface Recommendations {
  id: string;
  _id?: string;
  topics_to_revise: string[];
  weak_subjects: string[];
  practice_questions: string[];
  daily_goals: string[];
  learning_strategy: string;
  insights: string[];
  created_at: string;
}

export interface DashboardData {
  stats: {
    documents: number;
    flashcards: number;
    quizzes: number;
    studyHours: number;
    streak: number;
    avgScore: number;
    learnedFlashcards: number;
  };

  charts: {
    weeklyHours: {
      day: string;
      hours: number;
    }[];

    quizPerformance: {
      attempt: string;
      score: number;
    }[];

    subjectProgress: {
      subject: string;
      hours: number;
    }[];
  };

  recentActivities: {
    icon: string;
    text: string;
    time: string;
  }[];
}

export interface ProgressData {
  stats: {
    studyHours: number;
    streak: number;
    totalQuizzes: number;
    avgScore: number;
    bestScore: number;
    totalFlashcards: number;
    learnedFlashcards: number;
    bookmarkedFlashcards: number;
    totalDocuments: number;
  };

  charts: {
    studyHours30Days: {
      date: string;
      hours: number;
    }[];

    subjectProgress: {
      subject: string;
      hours: number;
    }[];

    difficultyDistribution: {
      difficulty: string;
      count: number;
    }[];

    quizScores: {
      attempt: string;
      score: number;
    }[];
  };

  achievements: {
    name: string;
    description: string;
    icon: string;
  }[];
}

export interface ApiError {
  success: false;
  message: string;
}