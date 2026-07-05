import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { Button, Dropdown } from 'antd';

export function MainLayout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const learnerMenu = [
    { key: 'dashboard', label: <Link to="/dashboard" className="font-bold text-lg">Tổng Quan</Link> },
    { key: 'my-decks', label: <Link to="/my-decks" className="font-bold text-lg">Bộ Thẻ Của Tôi</Link> },
    { key: 'explore', label: <Link to="/decks" className="font-bold text-lg">Khám Phá</Link> },
    { key: 'leaderboard', label: <Link to="/leaderboard" className="font-bold text-lg">Xếp Hạng</Link> },
  ];

  const adminMenu = [
    { key: 'dashboard', label: <Link to="/admin/dashboard" className="font-bold text-lg">Dashboard</Link> },
    { key: 'decks', label: <Link to="/admin/decks" className="font-bold text-lg">QL Thẻ</Link> },
    { key: 'quizzes', label: <Link to="/admin/quizzes" className="font-bold text-lg">QL Quiz</Link> },
    { key: 'tags', label: <Link to="/admin/tags" className="font-bold text-lg">Tags</Link> },
    { key: 'languages', label: <Link to="/admin/languages" className="font-bold text-lg">Ngôn Ngữ</Link> },
  ];

  const userDropdownItems = [
    { key: 'profile', label: <span className="font-bold">Hồ sơ cá nhân</span> },
    { key: 'logout', label: <span className="font-bold text-red-600">Đăng xuất</span>, onClick: handleLogout },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-brand-offwhite/90 backdrop-blur border-b-[3px] border-brand-black">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(hasRole(['ADMIN']) ? '/admin/dashboard' : '/dashboard')}>
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/images/lela_fox_logo.png" alt="LeLa Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-2xl font-black text-brand-navy tracking-tight">LeLa</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {hasRole(['ADMIN']) ? (
              adminMenu.map(item => <React.Fragment key={item.key}>{item.label}</React.Fragment>)
            ) : hasRole(['LEARNER']) ? (
              learnerMenu.map(item => <React.Fragment key={item.key}>{item.label}</React.Fragment>)
            ) : null}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Dropdown menu={{ items: userDropdownItems }} placement="bottomRight">
                <Button className="h-10 px-4 font-bold brutal-border brutal-pill bg-white text-brand-navy flex items-center gap-2">
                  <span>Hi, {user.username}</span>
                </Button>
              </Dropdown>
            ) : (
              <Button onClick={() => navigate('/login')} className="font-bold brutal-border brutal-pill bg-brand-coral text-white">
                Đăng nhập
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full bg-[#F4F3EE]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white py-8 border-t-[3px] border-brand-black mt-auto">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center">
          <div className="text-brand-navy font-bold text-lg mb-4 md:mb-0">
            LeLa - Học ngoại ngữ bằng Flashcard
          </div>
          <div className="text-brand-navy/60 font-medium">
            © 2026 LeLa Project. Soft Brutalism design.
          </div>
        </div>
      </footer>
    </div>
  );
}
