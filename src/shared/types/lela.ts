export interface ApiResponse<T = void> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export type UserRole = 'ADMIN' | 'CONTENT_CREATOR' | 'MODERATOR' | 'LEARNER';
export type DeckStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CardProgressState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';
export type SrsGrade = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';

export interface UserInfo {
  id: string;
  username: string;
  fullName?: string;
  email: string;
  roles: UserRole[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserInfo;
}

export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface LanguageResponse {
  id: number;
  languageCode: string;
  name: string;
  nativeName?: string;
  flagUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
}

export type DeckDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type DeckVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
export type DeckDisplayMode = 'FRONT' | 'BACK' | 'RANDOM';

export interface DeckResponse {
  id: number;
  deckCode: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl?: string;
  ownerId: number;
  languageId: number;
  category: string;
  difficulty: DeckDifficulty;
  visibility: DeckVisibility;
  status: DeckStatus;
  isFeatured: boolean;
  totalCards: number;
  viewCount: number;
  enrollmentCount: number;
  displayMode: DeckDisplayMode;
}

export interface FlashcardResponse {
  id: number;
  deckId: number;
  frontText: string;
  backText: string;
  phonetic?: string;
  exampleText?: string;
  hint?: string;
  note?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  frontAudioUrl?: string;
  backAudioUrl?: string;
  cardOrder: number;
  isActive: boolean;
  cardColor?: string;
  tagIds: number[];
}

export type DeckEnrollmentStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DROPPED';

export interface DeckEnrollmentResponse {
  id: number;
  userId: number;
  deckId: number;
  status: DeckEnrollmentStatus;
  enrolledAt: string;
  pausedAt?: string;
  completedAt?: string;
  droppedAt?: string;
  lastStudiedAt?: string;
  nextReviewAt?: string;
  masteredCards: number;
  note?: string;
}

export type QuizType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MIXED';

export interface QuizResponse {
  id: number;
  deckId: number;
  quizCode: string;
  title: string;
  description?: string;
  quizType: QuizType;
  timeLimitSeconds?: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_THE_BLANK';

export interface QuizQuestionResponse {
  id: number;
  questionText: string;
  questionImageUrl?: string;
  questionType: QuestionType;
  explanation?: string;
  points: number;
  questionTimeLimitSeconds?: number;
  displayOrder: number;
  isActive: boolean;
  version?: number;
}

export interface SubscriptionPlanResponse {
  id: number;
  planCode: string;
  name: string;
  description?: string;
  price: number;
  currencyCode: string;
  billingCycle: string;
  billingIntervalCount: number;
  maxOwnedDecks?: number;
  maxCardsPerDeck?: number;
  maxDailyReviews?: number;
  quizEnabled: boolean;
  leaderboardEnabled: boolean;
  offlineEnabled: boolean;
  featuresJson?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}





