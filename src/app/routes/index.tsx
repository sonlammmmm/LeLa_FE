import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LearnerLayout } from '../../shared/components/layout/LearnerLayout';
import { AdminLayout } from '../../shared/components/layout/AdminLayout';
import { LearnerThemeProvider } from '../../shared/providers/LearnerThemeProvider';
import { ThemeProvider } from '../../shared/providers/ThemeProvider';

// Lazy loading for all pages to optimize initial bundle size
const LandingPage = lazy(() => import('../../features/landing/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const TagsPage = lazy(() => import('../../features/master-data/pages/TagsPage').then(module => ({ default: module.TagsPage })));
const LanguagesPage = lazy(() => import('../../features/master-data/pages/LanguagesPage').then(module => ({ default: module.LanguagesPage })));
const UsersAdminPage = lazy(() => import('../../features/user-management/pages/UsersAdminPage').then(module => ({ default: module.UsersAdminPage })));
const TransactionsAdminPage = lazy(() => import('../../features/subscription/pages/TransactionsAdminPage').then(module => ({ default: module.TransactionsAdminPage })));
const SubscriptionPlansAdminPage = lazy(() => import('../../features/subscription/pages/SubscriptionPlansAdminPage').then(module => ({ default: module.SubscriptionPlansAdminPage })));
const NotificationsAdminPage = lazy(() => import('../../features/notifications/pages/NotificationsAdminPage').then(module => ({ default: module.NotificationsAdminPage })));
const TopicsAdminPage = lazy(() => import('../../features/master-data/pages/TopicsAdminPage').then(module => ({ default: module.TopicsAdminPage })));
const AchievementsAdminPage = lazy(() => import('../../features/gamification/pages/AchievementsAdminPage').then(module => ({ default: module.AchievementsAdminPage })));
const DecksAdminPage = lazy(() => import('../../features/study-content/pages/DecksAdminPage').then(module => ({ default: module.DecksAdminPage })));
const FlashcardsAdminPage = lazy(() => import('../../features/study-content/pages/FlashcardsAdminPage').then(module => ({ default: module.FlashcardsAdminPage })));
const ExploreDecksPage = lazy(() => import('../../features/study-content/pages/ExploreDecksPage').then(module => ({ default: module.ExploreDecksPage })));
const MyDecksPage = lazy(() => import('../../features/study-content/pages/MyDecksPage').then(module => ({ default: module.MyDecksPage })));
const StudyPage = lazy(() => import('../../features/study-session/pages/StudyPage').then(module => ({ default: module.StudyPage })));
const QuizzesAdminPage = lazy(() => import('../../features/quiz/pages/QuizzesAdminPage').then(module => ({ default: module.QuizzesAdminPage })));
const QuizBuilderAdminPage = lazy(() => import('../../features/quiz/pages/QuizBuilderAdminPage').then(module => ({ default: module.QuizBuilderAdminPage })));
const QuizAttemptPage = lazy(() => import('../../features/quiz/pages/QuizAttemptPage').then(module => ({ default: module.QuizAttemptPage })));
const MyQuizAttemptsPage = lazy(() => import('../../features/quiz/pages/MyQuizAttemptsPage').then(module => ({ default: module.MyQuizAttemptsPage })));
const LeaderboardPage = lazy(() => import('../../features/gamification/pages/LeaderboardPage').then(module => ({ default: module.LeaderboardPage })));
const ProfilePage = lazy(() => import('../../features/users/pages/ProfilePage').then(module => ({ default: module.ProfilePage })));
const LearnerDashboardPage = lazy(() => import('../../features/dashboard/pages/LearnerDashboardPage').then(module => ({ default: module.LearnerDashboardPage })));
const PricingPage = lazy(() => import('../../features/subscription/pages/PricingPage').then(module => ({ default: module.PricingPage })));
const AdminDashboardPage = lazy(() => import('../../features/dashboard/pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));

const Unauthorized = () => <div className="min-h-screen flex items-center justify-center text-2xl font-bold text-red-500">Unauthorized</div>;

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-geist-blue-500"></div>
  </div>
);

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
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
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Admin routes wrapped with ThemeProvider and AdminLayout */}
      <Route element={<ThemeProvider><AdminLayout /></ThemeProvider>}>
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CONTENT_CREATOR', 'MODERATOR']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']} />}>
            <Route path="/admin/users" element={<UsersAdminPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/notifications" element={<NotificationsAdminPage />} />
            <Route path="/admin/transactions" element={<TransactionsAdminPage />} />
            <Route path="/admin/subscription-plans" element={<SubscriptionPlansAdminPage />} />
            <Route path="/admin/tags" element={<TagsPage />} />
            <Route path="/admin/languages" element={<LanguagesPage />} />
            <Route path="/admin/topics" element={<TopicsAdminPage />} />
            <Route path="/admin/achievements" element={<AchievementsAdminPage />} />
          </Route>
          <Route path="/admin/decks" element={<DecksAdminPage />} />
          <Route path="/admin/decks/:deckId/flashcards" element={<FlashcardsAdminPage />} />
          <Route path="/admin/quizzes" element={<QuizzesAdminPage />} />
          <Route path="/admin/quizzes/new" element={<QuizBuilderAdminPage />} />
          <Route path="/admin/quizzes/:id/edit" element={<QuizBuilderAdminPage />} />
        </Route>
      </Route>
      </Routes>
    </Suspense>
  );
}
