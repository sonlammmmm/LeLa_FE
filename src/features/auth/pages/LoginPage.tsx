import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/providers/AuthProvider';
import { authApi } from '../api/auth.api';

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const res = await authApi.login({
        usernameOrEmail: values.username,
        password: values.password,
      });

      if (res.success && res.data) {
        login(res.data);
        message.success(res.message || 'Đăng nhập thành công');
        // Route based on roles
        const roles = res.data.user.roles;
        if (roles.includes('ADMIN')) {
          navigate('/admin/dashboard');
        } else {
          navigate('/my-decks');
        }
      } else {
        message.error(res.message || 'Đăng nhập thất bại');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 bg-[#F4F3EE]">
      <div className="brutal-card bg-white p-8 md:p-12 w-full max-w-md flex flex-col gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase text-[#1D2A3A]">LeLa</h1>
          <p className="text-gray-600 mt-2 font-medium">Đăng nhập để tiếp tục quá trình học tập.</p>
        </div>

        <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            label={<span className="font-bold text-[#1D2A3A]">Tên đăng nhập hoặc Email</span>}
            name="username"
            rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}
          >
            <Input className="brutal-border brutal-shadow-sm !h-12" placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-[#1D2A3A]">Mật khẩu</span>}
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password className="brutal-border brutal-shadow-sm !h-12" placeholder="••••••••" />
          </Form.Item>

          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            className="w-full !h-12 brutal-border brutal-shadow brutal-pill mt-4 !bg-[#F05A4A] !text-white hover:!translate-y-[-2px] hover:!bg-[#d94a39] transition-transform border-black"
          >
            ĐĂNG NHẬP
          </Button>
        </Form>
      </div>
    </div>
  );
}
