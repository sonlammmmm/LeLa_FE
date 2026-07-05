import { useQuery } from '@tanstack/react-query';
import { Button, Spin, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { dailyActivitiesApi } from '../../gamification/api/daily-activities.api';
import { srsReviewsApi } from '../../study-session/api/srs-reviews.api';

export function LearnerDashboardPage() {
  const navigate = useNavigate();

  const { data: activityData } = useQuery({
    queryKey: ['daily-activity', 'today'],
    queryFn: () => dailyActivitiesApi.getToday(),
  });

  const endDate = new Date().toISOString().split('T')[0];
  const startDateObj = new Date();
  startDateObj.setDate(startDateObj.getDate() - 364);
  const startDate = startDateObj.toISOString().split('T')[0];

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['daily-activity', 'history', startDate, endDate],
    queryFn: () => dailyActivitiesApi.getHistory({ startDate, endDate }),
  });

  const { data: srsStats } = useQuery({
    queryKey: ['srs-statistics'],
    queryFn: () => srsReviewsApi.getStatistics(),
  });

  const xp = activityData?.data?.xpEarned || 0;
  const cardsReviewed = activityData?.data?.cardsReviewed || 0;
  
  // Tạm tính tỷ lệ Mastered (Giả lập nếu BE chưa trả về Mastered %)
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
        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A] mb-8">Tổng quan học tập</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="brutal-card bg-white p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-500 font-bold uppercase mb-2">XP Hôm Nay</span>
            <span className="text-5xl font-black text-[#F05A4A]">{xp}</span>
          </div>
          <div className="brutal-card bg-white p-6 flex flex-col items-center justify-center text-center">
            <span className="text-gray-500 font-bold uppercase mb-2">Thẻ đã ôn</span>
            <span className="text-5xl font-black text-[#2A8B9D]">{cardsReviewed}</span>
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
        <div className="brutal-card bg-white p-8 mb-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-3xl font-black mb-6 uppercase border-b-[4px] border-black pb-4">Lịch sử hoạt động</h2>
          {isLoadingHistory ? (
            <div className="flex justify-center py-10"><Spin size="large" /></div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-1" style={{ maxWidth: '100%' }}>
                {heatmapDays.map((dateStr) => {
                  const dayXp = historyMap.get(dateStr) || 0;
                  return (
                    <Tooltip key={dateStr} title={`${dateStr}: ${dayXp} XP`}>
                      <div 
                        className="w-4 h-4 border-[2px] border-black" 
                        style={{ backgroundColor: getHeatmapColor(dayXp) }}
                      />
                    </Tooltip>
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
          <div className="brutal-card bg-white p-8 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black mb-6 uppercase border-b-[4px] border-black pb-4">Lối tắt</h2>
            <div className="flex flex-col gap-4">
              <Button onClick={() => navigate('/my-decks')} className="brutal-border h-16 font-black text-xl justify-start px-6 border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 transition-transform bg-[#F4F3EE]">
                📚 BỘ THẺ CỦA TÔI
              </Button>
              <Button onClick={() => navigate('/decks')} className="brutal-border h-16 font-black text-xl justify-start px-6 text-[#2A8B9D] border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 transition-transform bg-white">
                🔍 KHÁM PHÁ BỘ THẺ MỚI
              </Button>
              <Button onClick={() => navigate('/leaderboard')} className="brutal-border h-16 font-black text-xl justify-start px-6 text-[#F05A4A] border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 transition-transform bg-white">
                🏆 BẢNG XẾP HẠNG
              </Button>
              <Button onClick={() => navigate('/my-quiz-attempts')} className="brutal-border h-16 font-black text-xl justify-start px-6 border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 transition-transform bg-[#F4F3EE]">
                📝 LỊCH SỬ BÀI KIỂM TRA
              </Button>
            </div>
          </div>

          <div className="brutal-card bg-[#1D2A3A] p-8 text-white flex flex-col justify-center items-center text-center border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F05A4A] rounded-full translate-x-12 -translate-y-12 blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2A8B9D] rounded-full -translate-x-12 translate-y-12 blur-3xl opacity-50 pointer-events-none"></div>
            
            <h2 className="text-4xl font-black mb-6 text-[#F05A4A] z-10">SẴN SÀNG ÔN TẬP?</h2>
            <p className="text-2xl font-bold mb-8 z-10 bg-black/20 p-4 border-[3px] border-black">Đến lúc ôn tập để giữ chuỗi ngày học của bạn!</p>
            <Button onClick={() => navigate('/my-decks')} className="brutal-border brutal-shadow brutal-pill !bg-white !text-[#1D2A3A] h-16 px-10 font-black text-2xl hover:scale-105 hover:-translate-y-2 transition-transform z-10 border-[3px]">
              BẮT ĐẦU ÔN TẬP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
