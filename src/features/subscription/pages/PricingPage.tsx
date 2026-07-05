import { useQuery } from '@tanstack/react-query';
import { Button, Skeleton } from 'antd';
import { subscriptionPlansApi } from '../api/subscription-plans.api';
import { useNavigate } from 'react-router-dom';

export function PricingPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['public-pricing'],
    queryFn: () => subscriptionPlansApi.getAll(),
  });

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-8">
      <div className="max-w-7xl mx-auto text-center mb-16 mt-8">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-[#1D2A3A] mb-4">
          Nâng cấp trải nghiệm học tập
        </h1>
        <p className="text-xl text-gray-700">Chọn gói phù hợp nhất với nhu cầu của bạn</p>
      </div>

      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="brutal-card bg-white p-8 w-full md:w-1/3 min-h-[500px]">
                <Skeleton active />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center items-stretch">
            {data?.data?.map((plan) => (
              <div 
                key={plan.id}
                className="brutal-card bg-white p-8 w-full md:w-[350px] flex flex-col hover:-translate-y-2 transition-transform duration-300"
              >
                <div className="mb-4">
                  <h2 className="text-2xl font-black uppercase mb-2">{plan.name}</h2>
                  <p className="text-gray-600 line-clamp-2 min-h-[40px]">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="text-4xl font-black text-[#F05A4A]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: plan.currencyCode || 'VND' }).format(plan.price)}
                  </span>
                  <span className="text-gray-500 font-bold ml-2">/ {plan.billingCycle}</span>
                </div>

                <div className="flex-1 mb-8 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#2A8B9D]">✓</span>
                    <span className="font-bold">Tối đa {plan.maxOwnedDecks || '∞'} bộ thẻ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[#2A8B9D]">✓</span>
                    <span className="font-bold">Tối đa {plan.maxCardsPerDeck || '∞'} thẻ / bộ</span>
                  </div>
                  {plan.quizEnabled && (
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#2A8B9D]">✓</span>
                      <span className="font-bold">Mở khóa tính năng Thi & Quiz</span>
                    </div>
                  )}
                  {plan.leaderboardEnabled && (
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[#2A8B9D]">✓</span>
                      <span className="font-bold">Tham gia Bảng xếp hạng</span>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full brutal-border brutal-shadow h-12 font-black uppercase text-lg !bg-[#1D2A3A] !text-white"
                  onClick={() => navigate('/login')} // Redirect to payment / checkout later
                >
                  Đăng ký ngay
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
