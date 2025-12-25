
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface User {
  username: string;
  role: UserRole;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'MCQ' | 'STRUCTURE' | 'ESSAY';

export interface Year { id: string; name: string; }
export interface Subject { id: string; name: string; }
export interface Topic { id: string; name: string; }

export interface UserAnswer {
  questionId: string;
  selected: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  year: string;
  subject: string;
  topic: string;
  subTopic: string;
  section: string;
  type: QuestionType;
  question: string;
  options: string[];
  optionImages?: (string | undefined)[]; 
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
  image?: string; 
  imageDescription?: string;
}

export interface QuizSet {
  id: string;
  name: string;
  description: string;
  questionIds: string[];
  createdAt: string;
  assignedUsernames?: string[];
}

export interface QuizAttempt {
  id: string;
  username: string;
  topicId: string; 
  score: number;
  total: number;
  date: string;
  isCustomSet?: boolean;
  answers?: UserAnswer[];
}

export interface RegisteredUser extends User {
  password: string;
  isActive?: boolean; 
}
