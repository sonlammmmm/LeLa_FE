import { Table, Tag, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export function MyQuizAttemptsPage() {
  const navigate = useNavigate();

  // Skeleton data
  const data = [
    { id: 1, quizTitle: 'Tiếng Anh Căn Bản', score: 85, status: 'PASSED', date: '2024-01-01' },
    { id: 2, quizTitle: 'Ngữ Pháp Nâng Cao', score: 40, status: 'FAILED', date: '2024-01-05' },
  ];

  const columns = [
    { title: 'Tên bài kiểm tra', dataIndex: 'quizTitle' },
    { title: 'Ngày làm', dataIndex: 'date' },
    { title: 'Điểm số', dataIndex: 'score', render: (val: number) => <strong>{val}/100</strong> },
    { 
      title: 'Kết quả', 
      dataIndex: 'status', 
      render: (val: string) => (
        <Tag color={val === 'PASSED' ? '#2A8B9D' : '#F05A4A'} className="brutal-border font-bold">
          {val}
        </Tag>
      ) 
    },
    {
      title: 'Hành động',
      render: () => <Button className="brutal-border font-bold">Xem chi tiết</Button>
    }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-[#F4F3EE]">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#1D2A3A]">Lịch Sử Thi / Kiểm Tra</h1>
          <p className="text-gray-600 font-medium">Theo dõi các bài kiểm tra bạn đã hoàn thành.</p>
        </div>
        <Button onClick={() => navigate('/decks')} className="brutal-border font-bold">Về trang chủ</Button>
      </div>

      <div className="brutal-card bg-white p-4">
        <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />
      </div>
    </div>
  );
}
