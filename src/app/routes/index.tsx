import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../../features/landing/pages/LandingPage';
import { ProtectedRoute } from './ProtectedRoute';

import { TagsPage } from '../../features/master-data/pages/TagsPage';
import { LanguagesPage } from '../../features/master-data/pages/LanguagesPage';
import { UsersAdminPage } from '../../features/user-management/pages/UsersAdminPage';
import { TransactionsAdminPage } from '../../features/subscription/pages/TransactionsAdminPage';

import { DecksAdminPage } from '../../features/study-content/pages/DecksAdminPage';
import { FlashcardsAdminPage } from '../../features/study-content/pages/FlashcardsAdminPage';

import { ExploreDecksPage } from '../../features/study-content/pages/ExploreDecksPage';
import { MyDecksPage } from '../../features/study-content/pages/MyDecksPage';
import { StudyPage } from '../../features/study-session/pages/StudyPage';
import { QuizzesAdminPage } from '../../features/quiz/pages/QuizzesAdminPage';
import { QuizQuestionsAdminPage } from '../../features/quiz/pages/QuizQuestionsAdminPage';
import { QuizAttemptPage } from '../../features/quiz/pages/QuizAttemptPage';
import { MyQuizAttemptsPage } from '../../features/quiz/pages/MyQuizAttemptsPage';
import { LeaderboardPage } from '../../features/gamification/pages/LeaderboardPage';
import { LearnerDashboardPage } from '../../features/dashboard/pages/LearnerDashboardPage';
import { PricingPage } from '../../features/subscription/pages/PricingPage';
import { AdminDashboardPage } from '../../features/dashboard/pages/AdminDashboardPage';
import { LearnerLayout } from '../../shared/components/layout/LearnerLayout';
import { AdminLayout } from '../../shared/components/layout/AdminLayout';
import { LearnerThemeProvider } from '../../shared/providers/LearnerThemeProvider';
import { ThemeProvider } from '../../shared/providers/ThemeProvider';

const Unauthorized = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-red-500">Unauthorized</div>;

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LearnerThemeProvider><LandingPage /></LearnerThemeProvider>} />
      {/* Legacy auth routes redirect to home where modal can be triggered */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/pricing" element={<LearnerThemeProvider><PricingPage /></LearnerThemeProvider>} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Learner routes wrapped with LearnerThemeProvider and LearnerLayout */}
      <Route element={<LearnerThemeProvider><LearnerLayout /></LearnerThemeProvider>}>
        <Route element={<ProtectedRoute allowedRoles={['LEARNER']} />}>
          <Route path="/dashboard" element={<LearnerDashboardPage />} />
          <Route path="/my-decks" element={<MyDecksPage />} />
          <Route path="/decks" element={<ExploreDecksPage />} />
          <Route path="/study/:deckId" element={<StudyPage />} />
          <Route path="/quiz/:quizId/start" element={<QuizAttemptPage />} />
          <Route path="/my-quiz-attempts" element={<MyQuizAttemptsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>
      </Route>

      {/* Admin routes wrapped with ThemeProvider and AdminLayout */}
      <Route element={<ThemeProvider><AdminLayout /></ThemeProvider>}>
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CONTENT_CREATOR', 'MODERATOR']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/users" element={<UsersAdminPage />} />
            <Route path="/admin/transactions" element={<TransactionsAdminPage />} />
            <Route path="/admin/tags" element={<TagsPage />} />
            <Route path="/admin/languages" element={<LanguagesPage />} />
          </Route>
          <Route path="/admin/decks" element={<DecksAdminPage />} />
          <Route path="/admin/decks/:deckId/flashcards" element={<FlashcardsAdminPage />} />
          <Route path="/admin/quizzes" element={<QuizzesAdminPage />} />
          <Route path="/admin/quizzes/:quizId/questions" element={<QuizQuestionsAdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
