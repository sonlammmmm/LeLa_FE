import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { leaderboardsApi } from '../api/leaderboards.api';

export function LeaderboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'top'>('weekly');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => {
      switch (period) {
        case 'daily': return leaderboardsApi.getDaily({ size: 100 });
        case 'weekly': return leaderboardsApi.getWeekly({ size: 100 });
        case 'monthly': return leaderboardsApi.getMonthly({ size: 100 });
        default: return leaderboardsApi.getTop({ size: 100 });
      }
    },
  });

  const columns = [
    { 
      title: 'Hạng', 
      dataIndex: 'rank', 
      render: (_: any, __: any, index: number) => {
        let color = '#F4F3EE'; // Default
        if (index === 0) color = '#FFD700'; // Vàng
        if (index === 1) color = '#C0C0C0'; // Bạc
        if (index === 2) color = '#CD7F32'; // Đồng

        return (
          <div 
            className="w-10 h-10 flex items-center justify-center brutal-border brutal-shadow-sm font-black text-lg"
            style={{ backgroundColor: color }}
          >
            {index + 1}
          </div>
        );
      },
      width: 80
    },
    { title: 'Người dùng', dataIndex: 'userId', render: (val: number) => <span className="font-bold">User #{val}</span> },
    { title: 'Điểm kinh nghiệm (XP)', dataIndex: 'xpEarned', render: (val: number) => <span className="text-[#F05A4A] font-black">{val} XP</span> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A]">Bảng xếp hạng</h1>
            <p className="text-gray-600 font-medium mt-1">Đua top cùng những người học khác!</p>
          </div>
          <Button onClick={() => navigate('/my-decks')} className="brutal-border font-bold">&larr; Về trang chủ</Button>
        </div>

        <div className="flex gap-4 mb-6">
          <Button 
            className={`brutal-border font-bold ${period === 'daily' ? '!bg-[#1D2A3A] !text-white' : 'bg-white'}`}
            onClick={() => setPeriod('daily')}
          >
            Hôm nay
          </Button>
          <Button 
            className={`brutal-border font-bold ${period === 'weekly' ? '!bg-[#1D2A3A] !text-white' : 'bg-white'}`}
            onClick={() => setPeriod('weekly')}
          >
            Tuần này
          </Button>
          <Button 
            className={`brutal-border font-bold ${period === 'monthly' ? '!bg-[#1D2A3A] !text-white' : 'bg-white'}`}
            onClick={() => setPeriod('monthly')}
          >
            Tháng này
          </Button>
          <Button 
            className={`brutal-border font-bold ${period === 'top' ? '!bg-[#1D2A3A] !text-white' : 'bg-white'}`}
            onClick={() => setPeriod('top')}
          >
            Mọi thời đại
          </Button>
        </div>

        <div className="brutal-card bg-white p-4">
          {isLoading ? (
            <Skeleton active />
          ) : (
            <Table 
              dataSource={data?.data?.content || []} 
              columns={columns} 
              rowKey="id" 
              pagination={false}
              className="brutal-table"
            />
          )}
        </div>
      </div>
    </div>
  );
}
