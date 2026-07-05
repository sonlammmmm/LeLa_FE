import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { LogOut, LayoutDashboard, Tags, Languages, Book, HelpCircle, Moon, Sun, Monitor, Users, CreditCard } from 'lucide-react';
import type { UserRole } from '../../types/lela';

export function AdminLayout() {
  const { user, logout, hasRole } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  type NavItem = { name: string; path: string; icon: any; roles: UserRole[] };
  const navItems: NavItem[] = [
    { name: 'Bảng điều khiển', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['ADMIN'] },
    { name: 'Người dùng', path: '/admin/users', icon: Users, roles: ['ADMIN'] },
    { name: 'Giao dịch', path: '/admin/transactions', icon: CreditCard, roles: ['ADMIN'] },
    { name: 'Thẻ (Tags)', path: '/admin/tags', icon: Tags, roles: ['ADMIN'] },
    { name: 'Ngôn ngữ', path: '/admin/languages', icon: Languages, roles: ['ADMIN'] },
    { name: 'Bộ thẻ (Decks)', path: '/admin/decks', icon: Book, roles: ['ADMIN', 'CONTENT_CREATOR'] },
    { name: 'Bài kiểm tra', path: '/admin/quizzes', icon: HelpCircle, roles: ['ADMIN', 'CONTENT_CREATOR'] },
  ];

  return (
    <div className="min-h-screen bg-geist-bg-100 text-geist-gray-1000 font-sans selection:bg-geist-blue-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-geist-gray-400 bg-geist-bg-100/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard" className="text-xl font-bold tracking-tight">
            LeLa<span className="text-geist-gray-600">Admin</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center rounded-full border border-geist-gray-400 bg-geist-bg-200 p-1">
            <button
              onClick={() => setTheme('light')}
              className={`rounded-full p-1.5 transition-colors ${theme === 'light' ? 'bg-geist-bg-100 shadow-sm text-geist-gray-1000' : 'text-geist-gray-700 hover:text-geist-gray-1000'}`}
              title="Giao diện sáng"
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`rounded-full p-1.5 transition-colors ${theme === 'system' ? 'bg-geist-bg-100 shadow-sm text-geist-gray-1000' : 'text-geist-gray-700 hover:text-geist-gray-1000'}`}
              title="Giao diện hệ thống"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`rounded-full p-1.5 transition-colors ${theme === 'dark' ? 'bg-geist-bg-100 shadow-sm text-geist-gray-1000' : 'text-geist-gray-700 hover:text-geist-gray-1000'}`}
              title="Giao diện tối"
            >
              <Moon className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-geist-gray-400">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium leading-none">{user?.fullName || user?.username}</span>
              <span className="text-xs text-geist-gray-700 mt-1">{user?.roles.join(', ')}</span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-2 text-geist-gray-700 hover:bg-geist-gray-200 hover:text-geist-gray-1000 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex px-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 py-8 pr-6">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              // Ensure user has at least one of the required roles
              const canAccess = hasRole(item.roles);
              if (!canAccess) return null;

              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-geist-gray-200 text-geist-gray-1000'
                      : 'text-geist-gray-700 hover:bg-geist-gray-100 hover:text-geist-gray-1000'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-8 pl-6 border-l border-geist-gray-300 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
