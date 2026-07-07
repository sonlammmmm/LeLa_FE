import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Select, Switch, App, Modal } from 'antd';
import { UserOutlined, PictureOutlined, SaveOutlined } from '@ant-design/icons';
import { profileApi, type ProfileUpdateRequest } from '../api/profile.api';
import { languagesApi } from '../../master-data/api/languages.api';
import { BrutalNumberInput } from '../../../shared/components/ui/BrutalNumberInput';

const TIMEZONES = Intl.supportedValuesOf('timeZone');
const AVATAR_SEEDS = [
  'Felix', 'Luna', 'Oliver', 'Lucy', 'Leo', 'Milo', 'Cleo', 'Bella',
  'Simba', 'Loki', 'Max', 'Chloe', 'Lily', 'Nala', 'Zoe', 'Oscar',
  'Jasper', 'Finn', 'Mia', 'Ruby'
];

export function ProfilePage() {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getMe(),
  });

  const { data: languagesData, isLoading: isLoadingLangs } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getAll()
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

  const profile = data?.data;
  const languages = languagesData?.data || [];

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl,
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        dailyGoalCards: profile.dailyGoalCards || 20,
        nativeLanguageId: profile.nativeLanguageId,
        targetLanguageId: profile.targetLanguageId,
        promptDailyGoal: profile.promptDailyGoal ?? true,
      });
    }
  }, [profile, form]);

  if (isLoading) {
    return <div className="p-8 font-bold">Đang tải...</div>;
  }

  const onFinish = (values: any) => {
    updateMutation.mutate(values);
  };

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarPreview(e.target.value);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F4F3EE] p-4 sm:p-8 relative pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 lg:mb-12 gap-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#1D2A3A]">
            Hồ Sơ Cá Nhân
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Identity Card (Left Column) */}
          <div className="lg:col-span-4 brutal-card brutal-shadow bg-[#2A8B9D] border-[3px] border-black p-8 text-center flex flex-col items-center">
            <div 
              className="w-40 h-40 brutal-border border-black bg-[#F4F3EE] rounded-full shrink-0 overflow-hidden relative shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 transition-transform hover:-translate-y-1 group cursor-pointer"
              onClick={() => setIsAvatarModalOpen(true)}
            >
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
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400 bg-white">
                  <UserOutlined />
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <span className="text-white font-black text-xl uppercase tracking-wider">🎲 Chọn</span>
              </div>
            </div>
            
            <h2 className="text-3xl font-black uppercase text-white tracking-tight mb-1">{profile?.fullName || 'Học Viên'}</h2>
            <p className="text-[#F4F3EE] font-bold mb-6 truncate w-full px-4">@{profile?.username} &bull; {profile?.email}</p>
            
            <div className="flex flex-col gap-3 w-full">
              <div className="brutal-border px-4 py-3 bg-[#F4F3EE] flex justify-between items-center font-black text-lg text-[#1D2A3A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="text-brand-coral">🔥 Chuỗi</span>
                <span>{profile?.streakCurrent || 0} ngày</span>
              </div>
              <div className="brutal-border px-4 py-3 bg-[#FFD700] flex justify-between items-center font-black text-lg text-[#1D2A3A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span>⭐ Tổng XP</span>
                <span>{profile?.xpTotal || 0}</span>
              </div>
            </div>
          </div>

          {/* Form Settings (Right Column) */}
          <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                fullName: profile?.fullName,
                avatarUrl: profile?.avatarUrl,
                timezone: profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                dailyGoalCards: profile?.dailyGoalCards || 20,
                nativeLanguageId: profile?.nativeLanguageId,
                targetLanguageId: profile?.targetLanguageId,
                promptDailyGoal: profile?.promptDailyGoal ?? true,
              }}
              onFinish={onFinish}
              className="flex flex-col gap-6 lg:gap-8"
              requiredMark={false}
            >
              
              {/* Account Card */}
              <div className="brutal-card brutal-shadow bg-white border-[3px] border-black p-6 sm:p-8">
                <h3 className="text-2xl font-black uppercase text-[#1D2A3A] mb-6 border-b-4 border-[#F05A4A] inline-block pb-1">Thông tin tài khoản</h3>
                
                <div className="space-y-5">
                  <Form.Item
                    label={<span className="font-bold uppercase text-[#1D2A3A]">Họ và Tên</span>}
                    name="fullName"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                  >
                    <Input className="brutal-border brutal-shadow-sm h-14 font-black text-lg" prefix={<UserOutlined className="text-gray-400 mr-2" />} />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-bold uppercase text-[#1D2A3A]">Ảnh đại diện (URL)</span>}
                    name="avatarUrl"
                  >
                    <div className="flex gap-4">
                      <Input 
                        className="brutal-border brutal-shadow-sm h-14 font-black text-lg flex-1" 
                        prefix={<PictureOutlined className="text-gray-400 mr-2" />} 
                        placeholder="https://..." 
                        onChange={handleAvatarUrlChange}
                      />
                      <Button 
                        htmlType="button"
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="brutal-pill brutal-shadow-sm h-14 px-6 font-black text-lg bg-[#FFD700] hover:!bg-[#FFD700] hover:!text-black hover:!-translate-y-1 transition-all shrink-0"
                      >
                        🎲 Chọn Avatar
                      </Button>
                    </div>
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-bold uppercase text-[#1D2A3A]">Múi giờ (Timezone)</span>}
                    name="timezone"
                    rules={[{ required: true }]}
                  >
                    <Select 
                      showSearch
                      className="h-14 w-full font-black text-lg [&_.ant-select-selector]:!brutal-border [&_.ant-select-selector]:!brutal-shadow-sm [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!h-14 [&_.ant-select-selection-item]:!leading-[3.25rem] [&_.ant-select-selection-placeholder]:!leading-[3.25rem]"
                      options={TIMEZONES.map(tz => ({ label: tz, value: tz }))}
                      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="brutal-card brutal-shadow bg-[#F4F3EE] border-[3px] border-black p-6 sm:p-8">
                <h3 className="text-2xl font-black uppercase text-[#1D2A3A] mb-6 border-b-4 border-[#2A8B9D] inline-block pb-1">Sở thích học tập</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Form.Item
                    name="nativeLanguageId"
                    label={<span className="font-bold uppercase text-[#1D2A3A]">Ngôn ngữ mẹ đẻ</span>}
                    className="mb-0"
                  >
                    <Select
                      loading={isLoadingLangs}
                      className="h-14 w-full font-black text-lg [&_.ant-select-selector]:!brutal-border [&_.ant-select-selector]:!brutal-shadow-sm [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!h-14 [&_.ant-select-selection-item]:!leading-[3.25rem]"
                      options={languages.map(l => ({ label: l.name, value: l.id }))}
                    />
                  </Form.Item>

                  <Form.Item
                    name="targetLanguageId"
                    label={<span className="font-bold uppercase text-[#1D2A3A]">Ngôn ngữ muốn học</span>}
                    className="mb-0"
                  >
                    <Select
                      loading={isLoadingLangs}
                      className="h-14 w-full font-black text-lg [&_.ant-select-selector]:!brutal-border [&_.ant-select-selector]:!brutal-shadow-sm [&_.ant-select-selector]:!rounded-none [&_.ant-select-selector]:!h-14 [&_.ant-select-selection-item]:!leading-[3.25rem]"
                      options={languages.map(l => ({ label: l.name, value: l.id }))}
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="font-bold uppercase text-[#1D2A3A]">Mục tiêu hàng ngày (Số thẻ)</span>}
                  name="dailyGoalCards"
                  rules={[{ required: true }]}
                  className="mb-6"
                >
                  <BrutalNumberInput min={1} max={100} step={1} />
                </Form.Item>

                <Form.Item
                  name="promptDailyGoal"
                  valuePropName="checked"
                  className="mb-0 bg-white p-5 brutal-border brutal-shadow-sm flex items-center justify-between transition-transform hover:-translate-y-[2px]"
                >
                  <div className="flex items-center justify-between w-full gap-4">
                    <div className="flex-1">
                      <div className="font-black uppercase text-[#1D2A3A] text-lg">Hỏi mục tiêu mỗi ngày</div>
                      <div className="text-gray-500 font-bold mt-1 text-sm sm:text-base leading-tight">Hiển thị nhắc nhở nhập số thẻ mục tiêu vào lần học đầu tiên trong ngày.</div>
                    </div>
                    <Switch className="shrink-0" />
                  </div>
                </Form.Item>
              </div>

            </Form>
          </div>

        </div>
      </div>

      {/* Floating Save Action */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 pointer-events-none">
        <Button
          type="primary"
          onClick={() => form.submit()}
          loading={updateMutation.isPending}
          icon={<SaveOutlined />}
          className="pointer-events-auto brutal-pill !bg-[#F05A4A] !text-white h-16 px-8 font-black text-xl uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:!translate-y-[-4px] hover:!shadow-[6px_10px_0px_0px_rgba(0,0,0,1)] transition-all"
        >
          Lưu Thay Đổi
        </Button>
      </div>

      {/* Avatar Selection Modal */}
      <Modal
        title={<div className="font-black text-2xl uppercase tracking-tight text-[#1D2A3A] mb-4">Chọn Avatar</div>}
        open={isAvatarModalOpen}
        onCancel={() => setIsAvatarModalOpen(false)}
        footer={null}
        width={700}
        className="[&_.ant-modal-content]:!brutal-card [&_.ant-modal-content]:!border-[3px] [&_.ant-modal-content]:!border-black [&_.ant-modal-content]:!p-8 [&_.ant-modal-content]:!rounded-3xl"
        centered
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {AVATAR_SEEDS.map((seed) => {
            const url = `https://api.dicebear.com/9.x/micah/svg?seed=${seed}&backgroundColor=transparent`;
            const isSelected = avatarPreview === url || form.getFieldValue('avatarUrl') === url;
            
            return (
              <div 
                key={seed}
                onClick={() => {
                  setAvatarPreview(url);
                  form.setFieldsValue({ avatarUrl: url });
                  setIsAvatarModalOpen(false);
                }}
                className={`
                  aspect-square rounded-full brutal-border border-black overflow-hidden cursor-pointer transition-all duration-200
                  ${isSelected ? 'bg-[#FFD700] ring-4 ring-[#1D2A3A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-[#F4F3EE] hover:bg-gray-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}
                `}
              >
                <img src={url} alt={`Avatar ${seed}`} className="w-full h-full object-cover" loading="lazy" />
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Button 
            type="default" 
            onClick={() => setIsAvatarModalOpen(false)}
            className="brutal-pill !bg-gray-200 !text-black h-12 px-8 font-black uppercase tracking-wider hover:!bg-gray-300"
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </div>
  );
}
