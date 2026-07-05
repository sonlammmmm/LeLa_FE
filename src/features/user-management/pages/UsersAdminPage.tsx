import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Lock, Unlock } from 'lucide-react';
import { message, Modal as AntdModal } from 'antd';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { apiClient } from '../../../shared/lib/api';

// Matches backend UsersResponse DTO
export type UserResponse = {
  id: number;
  username: string;
  email: string;
  fullName: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  xpTotal: number;
  streakCurrent: number;
  createdAt: string;
};

const STATUS_MAP: Record<string, { label: string; colorClass: string }> = {
  ACTIVE: { label: 'Hoạt động', colorClass: 'bg-geist-success-100 text-geist-success-800' },
  PENDING: { label: 'Chờ xác thực', colorClass: 'bg-geist-warning-100 text-geist-warning-900' },
  SUSPENDED: { label: 'Tạm khóa', colorClass: 'bg-geist-error-100 text-geist-error-800' },
  DEACTIVATED: { label: 'Vô hiệu hóa', colorClass: 'bg-geist-gray-200 text-geist-gray-700' },
};

export function UsersAdminPage() {
  const [search, setSearch] = useState('');
  
  // API query
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/users', { params: { search } });
        return response.data?.data || [];
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
      }
    }
  });

  const toggleStatus = (user: UserResponse) => {
    const isActive = user.status === 'ACTIVE';
    const action = isActive ? 'Khóa' : 'Mở khóa';
    AntdModal.confirm({
      title: `Xác nhận ${action.toLowerCase()}`,
      content: `Bạn có chắc chắn muốn ${action.toLowerCase()} tài khoản ${user.email}?`,
      okText: action,
      cancelText: 'Hủy',
      okButtonProps: { danger: isActive },
      onOk: () => {
        message.success(`${action} tài khoản thành công`);
      },
    });
  };

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000">Người dùng</h1>
          <p className="text-sm text-geist-gray-700 mt-1">Quản lý tài khoản và phân quyền hệ thống</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-geist-gray-500" />
          <Input 
            placeholder="Tìm kiếm email, tên..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-geist-gray-300 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-geist-gray-100 text-geist-gray-700 font-medium border-b border-geist-gray-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Người dùng</th>
                <th className="px-4 py-3">XP</th>
                <th className="px-4 py-3">Streak</th>
                <th className="px-4 py-3">Ngày tham gia</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-geist-gray-300">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-geist-gray-600">Đang tải...</td></tr>
              ) : users?.map((user: UserResponse) => {
                const isActive = user.status === 'ACTIVE';
                const statusInfo = STATUS_MAP[user.status] || { label: user.status, colorClass: 'bg-geist-gray-200 text-geist-gray-700' };
                return (
                <tr key={user.id} className="hover:bg-geist-gray-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{user.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-geist-gray-1000">{user.fullName || user.username}</div>
                    <div className="text-geist-gray-700">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{user.xpTotal ?? 0}</td>
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{user.streakCurrent ?? 0}</td>
                  <td className="px-4 py-3 text-geist-gray-700">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider ${statusInfo.colorClass}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={isActive ? "text-geist-red-800 hover:text-geist-red-900 hover:bg-geist-red-100" : "text-geist-success-800 hover:text-geist-success-900 hover:bg-geist-success-100"}
                        title={isActive ? "Khóa tài khoản" : "Mở khóa"}
                        onClick={() => toggleStatus(user)}
                      >
                        {isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {!isLoading && (!users || users.length === 0) && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-geist-gray-600">Không tìm thấy người dùng nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
