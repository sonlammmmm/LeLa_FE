import { Statistic, Row, Col } from 'antd';

export function AdminDashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A]">
          Dashboard Tổng Quan
        </h1>
        <p className="text-gray-600 font-medium mt-1">Báo cáo hệ thống LeLa</p>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={6}>
          <div className="brutal-card bg-[#F05A4A] p-6 text-white text-center hover:-translate-y-2 transition-transform">
            <Statistic title={<span className="text-white font-bold uppercase">Tổng User</span>} value={1250} valueStyle={{ color: 'white', fontWeight: 900, fontSize: '3rem' }} />
          </div>
        </Col>
        <Col span={6}>
          <div className="brutal-card bg-[#2A8B9D] p-6 text-white text-center hover:-translate-y-2 transition-transform">
            <Statistic title={<span className="text-white font-bold uppercase">Doanh Thu Tháng</span>} value={45000000} suffix="VNĐ" valueStyle={{ color: 'white', fontWeight: 900, fontSize: '2rem' }} />
          </div>
        </Col>
        <Col span={6}>
          <div className="brutal-card bg-[#FFD700] p-6 text-[#1D2A3A] text-center hover:-translate-y-2 transition-transform">
            <Statistic title={<span className="text-[#1D2A3A] font-bold uppercase">Bộ Thẻ Hệ Thống</span>} value={142} valueStyle={{ color: '#1D2A3A', fontWeight: 900, fontSize: '3rem' }} />
          </div>
        </Col>
        <Col span={6}>
          <div className="brutal-card bg-white p-6 text-[#1D2A3A] text-center hover:-translate-y-2 transition-transform">
            <Statistic title={<span className="text-[#1D2A3A] font-bold uppercase">Thẻ Flashcard</span>} value={15200} valueStyle={{ color: '#1D2A3A', fontWeight: 900, fontSize: '3rem' }} />
          </div>
        </Col>
      </Row>

      <div className="mt-12 grid grid-cols-2 gap-8">
        <div className="brutal-card bg-white p-6 min-h-[400px]">
          <h2 className="text-2xl font-black uppercase mb-4">Hoạt động User 7 ngày qua</h2>
          <div className="w-full h-full flex items-center justify-center bg-gray-100 border-4 border-black border-dashed">
            <span className="font-bold text-gray-500">[ BIỂU ĐỒ RECHARTS ]</span>
          </div>
        </div>
        <div className="brutal-card bg-white p-6 min-h-[400px]">
          <h2 className="text-2xl font-black uppercase mb-4">Tỉ lệ gói Subscription</h2>
          <div className="w-full h-full flex items-center justify-center bg-gray-100 border-4 border-black border-dashed">
            <span className="font-bold text-gray-500">[ BIỂU ĐỒ TRÒN ]</span>
          </div>
        </div>
      </div>
    </div>
  );
}
