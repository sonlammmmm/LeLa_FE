import { useQuery } from '@tanstack/react-query';
import { Button, Spin, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { dailyActivitiesApi } from '../../gamification/api/daily-activities.api';
import { srsReviewsApi } from '../../study-session/api/srs-reviews.api';
import { profileApi } from '../../users/api/profile.api';
import { QuestionCircleOutlined } from '@ant-design/icons';

export function LearnerDashboardPage() {
  const navigate = useNavigate();
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

  const { data: activityData } = useQuery({
    queryKey: ['daily-activity', 'today'],
    queryFn: () => dailyActivitiesApi.getToday(),
  });

  const endDate = new Date().toISOString().split('T')[0];
  const startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() - 364);
  const startDate = startDateObj.toISOString().split('T')[0];
  const emptyDays = startDateObj.getDay();

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['daily-activity', 'history', startDate, endDate],
    queryFn: () => dailyActivitiesApi.getHistory({ startDate, endDate }),
  });

  const { data: srsStats } = useQuery({
    queryKey: ['srs-statistics'],
    queryFn: () => srsReviewsApi.getStatistics(),
  });

  const { data: profileResponse } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getMe,
  });

  const xp = activityData?.data?.xpEarned || 0;
  const totalXp = profileResponse?.data?.xpTotal || 0;
  
  // Tổng thẻ đã học và % thuần thục từ srsStats
  const totalCardsLearned = srsStats?.data?.totalCardsLearned || 0;
  const masteredPercent = srsStats?.data?.masteryPercentage || 0;

  // Compute Streak & Heatmap Map
  let streak = 0;
  const historyMap = new Map<string, number>();

  if (historyData?.data) {
    historyData.data.forEach((act: any) => {
      historyMap.set(act.activityDate, act.xpEarned || 0);
    });

    let currentDate = new Date();
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (historyMap.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // If today has no activity yet, we should check yesterday before breaking the streak.
        const todayStr = new Date().toISOString().split('T')[0];
        if (dateStr === todayStr) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
  }

  // Generate last 365 days for Heatmap
  const heatmapDays = Array.from({ length: 365 }).map((_, i) => {
    const d = new Date(startDateObj);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  // Helper to determine color based on XP
  const getHeatmapColor = (xp: number) => {
    if (xp === 0) return '#F4F3EE';
    if (xp < 50) return '#C2E5EA'; // Light Teal
    if (xp < 100) return '#70C2D1'; // Med Teal
    if (xp < 200) return '#2A8B9D'; // Brand Teal
    return '#1D2A3A'; // Dark Navy for very high
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8 gap-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A] m-0">Tổng quan học tập</h1>
          <button 
            onClick={() => setIsInfoModalVisible(true)} 
            className="w-10 h-10 rounded-full bg-[#FFD700] border-[3px] border-black brutal-shadow flex items-center justify-center font-black text-xl hover:-translate-y-1 hover:scale-105 transition-all"
            title="Giải thích các chỉ số"
          >
            !
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="brutal-card bg-white p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="text-gray-500 font-bold uppercase mb-2">XP Hôm Nay</span>
            <span className="text-5xl font-black text-[#F05A4A] mb-3">{xp}</span>
            <div className="brutal-pill bg-[#FFD700] px-4 py-1.5 border-[2px] border-black text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1">
              ⭐ Tổng: {totalXp} XP
            </div>
          </div>
          <div className="brutal-card bg-white p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-500 font-bold uppercase mb-2">Tổng thẻ đã học</span>
            <span className="text-5xl font-black text-[#2A8B9D]">{totalCardsLearned}</span>
          </div>
          <div className="brutal-card bg-white p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-500 font-bold uppercase mb-2">Độ thuần thục</span>
            <span className="text-5xl font-black text-[#2A8B9D]">{masteredPercent}%</span>
          </div>
          <div className="brutal-card bg-[#FFD700] p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-800 font-bold uppercase mb-2">Chuỗi ngày (Streak)</span>
            <span className="text-5xl font-black text-[#1D2A3A]">{streak} 🔥</span>
          </div>
        </div>

        {/* Heatmap Section */}
        <div className="brutal-card brutal-shadow bg-white p-8 mb-8">
          <h2 className="text-3xl font-black mb-6 uppercase border-b-[4px] border-black pb-4">Lịch sử hoạt động</h2>
          {isLoadingHistory ? (
            <div className="flex justify-center py-10"><Spin size="large" /></div>
          ) : (
            <div className="overflow-hidden">
              <div 
                className="grid gap-1 pb-2 overflow-x-auto" 
                style={{ gridTemplateRows: 'repeat(7, 1fr)', gridAutoFlow: 'column' }}
              >
                {/* Empty cells to align the first day correctly */}
                {Array.from({ length: emptyDays }).map((_, i) => (
                  <div key={`empty-${i}`} className="w-4 h-4 pointer-events-none opacity-0"></div>
                ))}
                
                {/* Heatmap cells */}
                {heatmapDays.map((dateStr) => {
                  const dayXp = historyMap.get(dateStr) || 0;
                  return (
                    <div 
                      key={dateStr}
                      title={`${dateStr}: ${dayXp} XP`}
                      className="w-4 h-4 border-[2px] border-black transition-transform hover:scale-125 cursor-pointer" 
                      style={{ backgroundColor: getHeatmapColor(dayXp) }}
                    />
                  );
                })}
              </div>
              
              <div className="mt-4 flex items-center gap-2 justify-end text-sm font-bold uppercase">
                <span>Ít</span>
                <div className="w-4 h-4 border-[2px] border-black bg-[#F4F3EE]"></div>
                <div className="w-4 h-4 border-[2px] border-black bg-[#C2E5EA]"></div>
                <div className="w-4 h-4 border-[2px] border-black bg-[#70C2D1]"></div>
                <div className="w-4 h-4 border-[2px] border-black bg-[#2A8B9D]"></div>
                <div className="w-4 h-4 border-[2px] border-black bg-[#1D2A3A]"></div>
                <span>Nhiều</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="brutal-card brutal-shadow bg-white p-8">
            <h2 className="text-3xl font-black mb-6 uppercase border-b-[4px] border-black pb-4">Lối tắt</h2>
            <div className="flex flex-col gap-4">
              <Button onClick={() => navigate('/my-decks')} className="brutal-card h-16 font-black text-xl justify-start px-6 bg-[#F4F3EE] hover:-translate-y-1 transition-transform w-full">
                📚 BỘ THẺ CỦA TÔI
              </Button>
              <Button onClick={() => navigate('/decks')} className="brutal-card h-16 font-black text-xl justify-start px-6 text-[#2A8B9D] bg-white hover:-translate-y-1 transition-transform w-full">
                🔍 KHÁM PHÁ BỘ THẺ MỚI
              </Button>
              <Button onClick={() => navigate('/leaderboard')} className="brutal-card h-16 font-black text-xl justify-start px-6 text-[#F05A4A] bg-white hover:-translate-y-1 transition-transform w-full">
                🏆 BẢNG XẾP HẠNG
              </Button>
              <Button onClick={() => navigate('/my-quiz-attempts')} className="brutal-card h-16 font-black text-xl justify-start px-6 bg-[#F4F3EE] hover:-translate-y-1 transition-transform w-full">
                📝 LỊCH SỬ BÀI KIỂM TRA
              </Button>
            </div>
          </div>

          <div className="brutal-card brutal-shadow bg-[#1D2A3A] p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F05A4A] rounded-full translate-x-12 -translate-y-12 blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2A8B9D] rounded-full -translate-x-12 translate-y-12 blur-3xl opacity-50 pointer-events-none"></div>
            
            <h2 className="text-4xl font-black mb-6 text-[#F05A4A] z-10">SẴN SÀNG ÔN TẬP?</h2>
            <p className="text-2xl font-bold mb-8 z-10 bg-black/20 p-4 border-[3px] border-black">Đến lúc ôn tập để giữ chuỗi ngày học của bạn!</p>
            <Button onClick={() => navigate('/my-decks')} className="brutal-pill !bg-white !text-[#1D2A3A] h-16 px-10 font-black text-2xl hover:scale-105 hover:-translate-y-1 transition-transform z-10">
              BẮT ĐẦU ÔN TẬP
            </Button>
          </div>
        </div>
      </div>
      
      {/* Information Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3 border-b-[3px] border-black pb-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#2A8B9D] flex items-center justify-center text-white border-[2px] border-black">
              <QuestionCircleOutlined />
            </div>
            <span className="text-2xl font-bold uppercase text-[#1D2A3A]">Ý nghĩa các chỉ số</span>
          </div>
        }
        open={isInfoModalVisible}
        onCancel={() => setIsInfoModalVisible(false)}
        footer={
          <Button 
            onClick={() => setIsInfoModalVisible(false)}
            className="brutal-pill bg-[#F05A4A] text-white font-bold h-12 px-8 border-[2px] border-black hover:-translate-y-1 transition-transform"
          >
            ĐÃ HIỂU
          </Button>
        }
        wrapClassName="brutal-modal-wrap"
        closeIcon={null}
        width={500}
      >
        <div className="flex flex-col gap-4 py-4">
          <div className="brutal-card p-4 bg-[#F4F3EE]">
            <h3 className="font-bold text-lg text-[#1D2A3A] mb-1">XP Hôm Nay</h3>
            <p className="text-gray-700 m-0 font-medium">Là tổng điểm kinh nghiệm bạn đã tích lũy được trong ngày hôm nay bằng cách học thẻ mới hoặc ôn tập lại thẻ cũ.</p>
          </div>
          <div className="brutal-card p-4 bg-[#F4F3EE]">
            <h3 className="font-bold text-lg text-[#2A8B9D] mb-1">Tổng thẻ đã học</h3>
            <p className="text-gray-700 m-0 font-medium">Tổng số thẻ ghi nhớ mà bạn đã từng tương tác và bắt đầu học trên hệ thống, không tính các thẻ mới tinh chưa bao giờ mở.</p>
          </div>
          <div className="brutal-card p-4 bg-[#F4F3EE]">
            <h3 className="font-bold text-lg text-[#2A8B9D] mb-1">Độ thuần thục</h3>
            <p className="text-gray-700 m-0 font-medium">Tỷ lệ phần trăm các thẻ bạn đã chuyển sang trạng thái "Thuần thục" (Mastered) trên tổng số thẻ đã học. Chăm chỉ ôn tập khi đến hạn sẽ giúp tăng tỷ lệ này!</p>
          </div>
          <div className="brutal-card p-4 bg-[#FFD700]">
            <h3 className="font-bold text-lg text-[#1D2A3A] mb-1">Chuỗi ngày (Streak)</h3>
            <p className="text-gray-800 m-0 font-medium">Số ngày liên tiếp bạn có hoạt động học tập (kiếm được ít nhất 1 XP). Chuỗi sẽ về 0 nếu bạn bỏ lỡ một ngày.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
