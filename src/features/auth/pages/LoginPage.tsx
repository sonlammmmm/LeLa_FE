import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/providers/AuthProvider';
import { apiClient } from '../../../shared/lib/api';
import { Button, Form, Input, App } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { BackgroundPattern } from '../../landing/components/BackgroundPattern';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/login', {
        usernameOrEmail: values.usernameOrEmail,
        password: values.password
      });
      if (res.data.success && res.data.data) {
        login(res.data.data);
        message.success('Đăng nhập thành công!');
        navigate('/dashboard');
      } else {
        throw new Error('Đăng nhập thất bại');
      }
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F3EE] p-4 relative font-sans">
      <BackgroundPattern />
      <div className="z-10 w-full max-w-md">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 font-bold text-brand-navy hover:text-brand-coral transition-colors"
        >
          <ArrowLeftOutlined /> Quay lại trang chủ
        </button>

        <div className="brutal-card brutal-shadow bg-white p-8 border-[3px] border-black">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black uppercase text-brand-navy mb-2 tracking-tighter">Đăng Nhập</h1>
            <p className="font-bold text-gray-500">Chào mừng trở lại với LeLa!</p>
          </div>

          <Form layout="vertical" onFinish={onFinish} requiredMark={false} className="space-y-4">
            <Form.Item
              name="usernameOrEmail"
              label={<span className="font-bold uppercase text-brand-navy">Tên đăng nhập hoặc Email</span>}
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập hoặc email!' }]}
            >
              <Input 
                prefix={<MailOutlined className="text-gray-400" />} 
                placeholder="Ví dụ: lela_user" 
                className="brutal-border brutal-shadow-sm h-14 font-bold text-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="font-bold uppercase text-brand-navy">Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />} 
                placeholder="Nhập mật khẩu của bạn" 
                className="brutal-border brutal-shadow-sm h-14 font-bold text-lg"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full brutal-pill !bg-brand-coral !text-white h-14 font-black text-xl uppercase tracking-wider hover:!translate-y-[-2px] hover:!shadow-[4px_6px_0px_0px_rgba(0,0,0,1)] transition-all mt-4"
            >
              Đăng Nhập
            </Button>

            <div className="text-center mt-6 font-bold text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-brand-navy underline hover:text-brand-coral">
                Đăng ký ngay
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
