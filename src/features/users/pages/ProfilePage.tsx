import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Select, InputNumber } from 'antd';
import { UserOutlined, PictureOutlined, SaveOutlined } from '@ant-design/icons';
import { profileApi, type ProfileUpdateRequest } from '../api/profile.api';
import { App } from 'antd';

export function ProfilePage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getMe(),
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProfileUpdateRequest) => profileApi.updateMe(values),
    onSuccess: (res) => {
      message.success('Cập nhật thông tin thành công!');
      queryClient.setQueryData(['profile', 'me'], res);
    },
    onError: () => {
      message.error('Cập nhật thất bại. Vui lòng thử lại.');
    }
  });

  if (isLoading) {
    return <div className="p-8 font-bold">Đang tải...</div>;
  }

  const profile = data?.data;

  const onFinish = (values: any) => {
    updateMutation.mutate(values);
  };

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarPreview(e.target.value);
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A] mb-8 border-b-[3px] border-black pb-4">
          Hồ Sơ Cá Nhân
        </h1>

        <div className="brutal-card brutal-shadow bg-white p-8">
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="w-32 h-32 brutal-border bg-gray-200 shrink-0 overflow-hidden relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {(avatarPreview || profile?.avatarUrl) ? (
                <img 
                  src={avatarPreview || profile?.avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/F4F3EE/1D2A3A?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 bg-[#F4F3EE]">
                  <UserOutlined />
                </div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-2xl font-black uppercase text-[#1D2A3A]">{profile?.fullName}</h2>
              <p className="text-gray-500 font-bold mb-2">@{profile?.username} &bull; {profile?.email}</p>
              <div className="flex gap-4 mt-2">
                <div className="brutal-border px-3 py-1 bg-[#F4F3EE] font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  🔥 Chuỗi: {profile?.streakCurrent} ngày
                </div>
                <div className="brutal-border px-3 py-1 bg-[#FFD700] font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  ⭐ {profile?.xpTotal} XP
                </div>
              </div>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            initialValues={{
              fullName: profile?.fullName,
              avatarUrl: profile?.avatarUrl,
              timezone: profile?.timezone || 'UTC',
              dailyGoalCards: profile?.dailyGoalCards || 20,
            }}
            onFinish={onFinish}
            className="space-y-4"
          >
            <Form.Item
              label={<span className="font-bold uppercase text-[#1D2A3A]">Họ và Tên</span>}
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
            >
              <Input className="brutal-border brutal-shadow-sm h-12 font-bold text-lg" prefix={<UserOutlined />} />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold uppercase text-[#1D2A3A]">Ảnh đại diện (URL)</span>}
              name="avatarUrl"
            >
              <Input 
                className="brutal-border brutal-shadow-sm h-12 font-bold text-lg" 
                prefix={<PictureOutlined />} 
                placeholder="https://..." 
                onChange={handleAvatarUrlChange}
              />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label={<span className="font-bold uppercase text-[#1D2A3A]">Mục tiêu hàng ngày (Thẻ)</span>}
                name="dailyGoalCards"
                rules={[{ required: true }]}
              >
                <InputNumber min={1} max={1000} className="brutal-border brutal-shadow-sm h-12 font-bold text-lg w-full flex items-center" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold uppercase text-[#1D2A3A]">Múi giờ (Timezone)</span>}
                name="timezone"
                rules={[{ required: true }]}
              >
                <Select className="h-12 w-full font-bold [&_.ant-select-selector]:!brutal-border [&_.ant-select-selector]:!brutal-shadow-sm [&_.ant-select-selector]:!rounded-none">
                  <Select.Option value="UTC">UTC</Select.Option>
                  <Select.Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</Select.Option>
                  <Select.Option value="America/New_York">America/New_York</Select.Option>
                </Select>
              </Form.Item>
            </div>

            <div className="pt-4 mt-6 border-t-[3px] border-black">
              <Button
                type="primary"
                htmlType="submit"
                loading={updateMutation.isPending}
                icon={<SaveOutlined />}
                className="w-full brutal-pill !bg-[#2A8B9D] !text-white h-14 font-black text-xl uppercase tracking-wider hover:!translate-y-[-2px] hover:!shadow-[4px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                Lưu Thay Đổi
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
