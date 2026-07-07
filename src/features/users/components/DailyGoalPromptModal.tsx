import { useState, useEffect } from 'react';
import { Modal, Button, App } from 'antd';
import { useAuth } from '../../../shared/providers/AuthProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profile.api';
import { BrutalNumberInput } from '../../../shared/components/ui/BrutalNumberInput';

export function DailyGoalPromptModal() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(false);
  const [goal, setGoal] = useState<number>(20);

  useEffect(() => {
    if (!user || user.promptDailyGoal === false) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const lastPromptDate = localStorage.getItem('lela_last_goal_prompt_date');

    if (lastPromptDate !== todayStr) {
      setGoal(user.dailyGoalCards || 20);
      // Wait a moment for layout to settle
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (newGoal: number) => profileApi.updateMe({ dailyGoalCards: newGoal }),
    onSuccess: () => {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('lela_last_goal_prompt_date', todayStr);
      message.success('Đã cập nhật mục tiêu học tập hôm nay!');
      
      // Update local context user so promptDailyGoal changes immediately reflect
      // The API returns the updated UserResponse. We can mock it or invalidate queries.
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      
      // Also update the AuthContext if necessary, though useAuth user is primarily from login.
      // We will just hide the modal.
      setVisible(false);
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi lưu mục tiêu.');
    }
  });

  const handleSave = () => {
    updateMutation.mutate(goal);
  };

  const handleSkip = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('lela_last_goal_prompt_date', todayStr);
    setVisible(false);
  };

  return (
    <Modal
      open={visible}
      closable={false}
      mask={{ closable: false }}
      footer={null}
      className="[&_.ant-modal-content]:!brutal-card [&_.ant-modal-content]:!p-8 [&_.ant-modal-content]:!border-[3px] [&_.ant-modal-content]:!border-black [&_.ant-modal-content]:!rounded-3xl"
      width={400}
      centered
    >
      <div className="text-center">
        <div className="text-5xl mb-4">🦊</div>
        <h2 className="text-2xl font-black uppercase text-brand-navy mb-2 tracking-tighter">
          Mục tiêu hôm nay
        </h2>
        <p className="font-bold text-gray-500 mb-6">
          Bạn muốn ôn tập bao nhiêu thẻ từ vựng trong hôm nay?
        </p>

        <div className="mb-6">
          <BrutalNumberInput
            min={1}
            max={100}
            step={1}
            value={goal}
            onChange={(val) => setGoal(val || 20)}
          />
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleSkip}
            className="flex-1 brutal-pill !bg-gray-200 !text-brand-navy h-14 font-black text-lg hover:!bg-gray-300 transition-colors"
          >
            Bỏ qua
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={updateMutation.isPending}
            className="flex-1 brutal-pill !bg-brand-coral !text-white h-14 font-black text-lg tracking-wider hover:!translate-y-[-2px] hover:!shadow-[4px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Quyết tâm!
          </Button>
        </div>
      </div>
    </Modal>
  );
}
