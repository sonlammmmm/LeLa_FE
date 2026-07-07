import { Table, Tag, Button, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { quizAttemptsApi } from '../api/quiz-attempts.api';

export function MyQuizAttemptsPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-quiz-attempts'],
    queryFn: () => quizAttemptsApi.getMyAttempts({ size: 50 }),
  });

  const columns = [
    { title: 'Tên bài kiểm tra', dataIndex: 'quizTitle', render: (_: any, record: any) => <span className="font-bold">{record.quizTitle || `Quiz #${record.quizId}`}</span> },
    { title: 'Ngày làm', dataIndex: 'startedAt', render: (val: string) => val ? new Date(val).toLocaleDateString('vi-VN') : '-' },
    { title: 'Điểm số', dataIndex: 'scorePercent', render: (val: number) => <strong className="text-lg">{val != null ? Number(val).toFixed(0) : 0} / 100</strong> },
    { 
      title: 'Kết quả', 
      render: (_: any, record: any) => {
        const isPassed = record.passed === true;
        return (
          <Tag color={isPassed ? '#2A8B9D' : '#F05A4A'} className="brutal-border font-bold px-3 py-1 text-sm">
            {isPassed ? 'ĐẠT' : 'CHƯA ĐẠT'}
          </Tag>
        );
      }
    },
    {
      title: 'Hành động',
      render: (_: any, record: any) => (
        <Button 
          className="brutal-border font-bold hover:!bg-[#1D2A3A] hover:!text-white transition-colors"
          onClick={() => navigate(`/quiz-attempts/${record.publicId}/result`)}
        >
          Xem kết quả
        </Button>
      )
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-[#F4F3EE]">
      <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A]">Lịch Sử Thi / Kiểm Tra</h1>
          <p className="text-gray-600 font-medium text-lg mt-1">Theo dõi các bài kiểm tra bạn đã hoàn thành.</p>
        </div>
        <Button onClick={() => navigate('/decks')} className="brutal-border font-bold h-12 px-6 shadow-sm">
          VỀ TRANG CHỦ
        </Button>
      </div>

      <div className="brutal-card bg-white p-6 shadow-md border-4 border-black">
        {isLoading ? (
          <Skeleton active />
        ) : (
          <Table 
            dataSource={data?.data?.content || []} 
            columns={columns} 
            rowKey="publicId"
            pagination={false} 
            className="brutal-table"
            locale={{ emptyText: <div className="py-10 font-bold text-lg text-gray-500">Chưa có bài kiểm tra nào.</div> }}
          />
        )}
      </div>
    </div>
  );
}
