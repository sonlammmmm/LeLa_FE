import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { dailyActivitiesApi } from '../../gamification/api/daily-activities.api';

export function LearnerDashboardPage() {
  const navigate = useNavigate();

  const { data: activityData } = useQuery({
    queryKey: ['daily-activity'],
    queryFn: () => dailyActivitiesApi.getToday(),
  });

  const xp = activityData?.data?.xpEarned || 0;
  const cardsReviewed = activityData?.data?.cardsReviewed || 0;
  const streak = 5; // Demo streak

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A] mb-8">Tổng quan học tập</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="brutal-card bg-white p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-500 font-bold uppercase mb-2">XP Hôm Nay</span>
            <span className="text-5xl font-black text-[#F05A4A]">{xp}</span>
          </div>
          <div className="brutal-card bg-white p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-500 font-bold uppercase mb-2">Thẻ đã ôn</span>
            <span className="text-5xl font-black text-[#2A8B9D]">{cardsReviewed}</span>
          </div>
          <div className="brutal-card bg-[#FFD700] p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-800 font-bold uppercase mb-2">Chuỗi ngày (Streak)</span>
            <span className="text-5xl font-black text-[#1D2A3A]">{streak} 🔥</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="brutal-card bg-white p-6">
            <h2 className="text-2xl font-black mb-4">Lối tắt</h2>
            <div className="flex flex-col gap-4">
              <Button onClick={() => navigate('/my-decks')} className="brutal-border h-14 font-bold text-lg justify-start px-6">
                📚 Tiếp tục học các bộ thẻ của tôi
              </Button>
              <Button onClick={() => navigate('/decks')} className="brutal-border h-14 font-bold text-lg justify-start px-6 text-[#2A8B9D]">
                🔍 Khám phá bộ thẻ mới
              </Button>
              <Button onClick={() => navigate('/leaderboard')} className="brutal-border h-14 font-bold text-lg justify-start px-6 text-[#F05A4A]">
                🏆 Bảng xếp hạng
              </Button>
              <Button onClick={() => navigate('/my-quiz-attempts')} className="brutal-border h-14 font-bold text-lg justify-start px-6">
                📝 Lịch sử bài kiểm tra
              </Button>
            </div>
          </div>

          <div className="brutal-card bg-[#1D2A3A] p-6 text-white flex flex-col justify-center items-center text-center">
            <h2 className="text-3xl font-black mb-4 text-[#F05A4A]">Sẵn sàng ôn tập?</h2>
            <p className="text-xl mb-6">Bạn có 15 thẻ cần ôn hôm nay để giữ vững phong độ!</p>
            <Button onClick={() => navigate('/my-decks')} className="brutal-border brutal-shadow brutal-pill !bg-white !text-[#1D2A3A] h-14 px-8 font-black text-xl hover:scale-105 transition-transform">
              BẮT ĐẦU ÔN TẬP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
