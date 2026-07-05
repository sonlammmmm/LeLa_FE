import { Routes, Route } from 'react-router-dom';
import { LandingPage } from '../../features/landing/pages/LandingPage';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../../features/auth/pages/LoginPage';

import { TagsPage } from '../../features/master-data/pages/TagsPage';
import { LanguagesPage } from '../../features/master-data/pages/LanguagesPage';

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
import { MainLayout } from '../../shared/components/layout/MainLayout';

const Unauthorized = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-red-500">Unauthorized</div>;

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes (No Header/Footer from MainLayout, they handle it themselves) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Routes wrapped with Header & Footer */}
      <Route element={<MainLayout />}>
        {/* Protected Learner routes */}
        <Route element={<ProtectedRoute allowedRoles={['LEARNER']} />}>
          <Route path="/dashboard" element={<LearnerDashboardPage />} />
          <Route path="/my-decks" element={<MyDecksPage />} />
          <Route path="/decks" element={<ExploreDecksPage />} />
          <Route path="/study/:deckId" element={<StudyPage />} />
          <Route path="/quiz/:quizId/start" element={<QuizAttemptPage />} />
          <Route path="/my-quiz-attempts" element={<MyQuizAttemptsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Route>

        {/* Protected Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/tags" element={<TagsPage />} />
          <Route path="/admin/languages" element={<LanguagesPage />} />
          <Route path="/admin/decks" element={<DecksAdminPage />} />
          <Route path="/admin/decks/:deckId/flashcards" element={<FlashcardsAdminPage />} />
          <Route path="/admin/quizzes" element={<QuizzesAdminPage />} />
          <Route path="/admin/quizzes/:quizId/questions" element={<QuizQuestionsAdminPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
