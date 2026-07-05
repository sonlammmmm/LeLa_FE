import { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/providers/AuthProvider';
import { authApi } from '../api/auth.api';

interface AuthModalProps {
  open: boolean;
  onCancel: () => void;
  defaultView?: 'login' | 'register';
}

export function AuthModal({ open, onCancel, defaultView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(defaultView);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // Reset forms and view when modal opens/closes
  useEffect(() => {
    if (open) {
      setView(defaultView);
      loginForm.resetFields();
      registerForm.resetFields();
    }
  }, [open, defaultView, loginForm, registerForm]);

  const onLogin = async (values: any) => {
    try {
      setLoading(true);
      const res = await authApi.login({
        usernameOrEmail: values.username,
        password: values.password,
      });

      if (res.success && res.data) {
        login(res.data);
        message.success(res.message || 'Đăng nhập thành công');
        onCancel();
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

  const onRegister = async (values: any) => {
    try {
      setLoading(true);
      const res = await authApi.register({
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });

      if (res.success) {
        message.success('Đăng ký thành công! Vui lòng đăng nhập.');
        setView('login');
      } else {
        message.error(res.message || 'Đăng ký thất bại');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={view === 'register' ? 800 : 450}
      className="brutal-modal"
      centered
      closeIcon={<span className="font-black text-xl hover:text-brand-coral">X</span>}
    >
      <div className="p-2 md:p-6 flex flex-col gap-6 relative">
        <div className="text-center md:text-left mb-2">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <img src="/images/lela_fox_logo.png" alt="LeLa Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <h1 className="text-4xl font-black tracking-tighter uppercase text-[#1D2A3A] m-0 mt-1">LeLa</h1>
          </div>
          <p className="text-gray-600 mt-2 font-medium">
            {view === 'login' ? 'Đăng nhập để tiếp tục quá trình học tập.' : 'Đăng ký tài khoản để bắt đầu học tập.'}
          </p>
        </div>

        {view === 'login' ? (
          <Form form={loginForm} layout="vertical" onFinish={onLogin} requiredMark={false} size="large">
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
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, max: 32, message: 'Mật khẩu phải từ 6-32 ký tự' }
              ]}
            >
              <Input.Password className="brutal-border brutal-shadow-sm !h-12" placeholder="••••••••" />
            </Form.Item>

            <div className="flex justify-center w-full mt-8">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full !h-14 brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white font-black text-lg hover:!translate-y-[-2px] hover:!bg-[#d94a39] transition-transform border-black"
              >
                ĐĂNG NHẬP
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <span className="font-medium text-gray-600">Chưa có tài khoản? </span>
              <button 
                type="button" 
                onClick={() => setView('register')} 
                className="font-black text-[#2A8B9D] hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Đăng ký ngay
              </button>
            </div>
          </Form>
        ) : (
          <Form form={registerForm} layout="vertical" onFinish={onRegister} requiredMark={false} size="large">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <Form.Item
                label={<span className="font-bold text-[#1D2A3A]">Họ và Tên</span>}
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
              >
                <Input className="brutal-border brutal-shadow-sm !h-12" placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-[#1D2A3A]">Tên đăng nhập</span>}
                name="username"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                  { min: 3, max: 50, message: 'Từ 3-50 ký tự' }
                ]}
              >
                <Input className="brutal-border brutal-shadow-sm !h-12" placeholder="nguyenvana" />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="font-bold text-[#1D2A3A]">Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Định dạng email không hợp lệ' }
              ]}
            >
              <Input className="brutal-border brutal-shadow-sm !h-12" placeholder="user@example.com" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <Form.Item
                label={<span className="font-bold text-[#1D2A3A]">Mật khẩu</span>}
                name="password"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu' },
                  { min: 6, max: 32, message: 'Mật khẩu phải từ 6-32 ký tự' }
                ]}
              >
                <Input.Password className="brutal-border brutal-shadow-sm !h-12" placeholder="••••••••" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-[#1D2A3A]">Xác nhận Mật khẩu</span>}
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password className="brutal-border brutal-shadow-sm !h-12" placeholder="••••••••" />
              </Form.Item>
            </div>

            <div className="flex justify-center w-full mt-8">
              <Button 
                htmlType="submit" 
                loading={loading}
                className="w-full md:w-auto md:min-w-[240px] !h-14 brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white font-black text-lg hover:!translate-y-[-2px] hover:!bg-[#d94a39] transition-transform border-black"
              >
                ĐĂNG KÝ
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <span className="font-medium text-gray-600">Đã có tài khoản? </span>
              <button 
                type="button" 
                onClick={() => setView('login')} 
                className="font-black text-[#2A8B9D] hover:underline bg-transparent border-none cursor-pointer p-0"
              >
                Đăng nhập ngay
              </button>
            </div>
          </Form>
        )}
      </div>
    </Modal>
  );
}
