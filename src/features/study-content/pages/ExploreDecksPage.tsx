import { useQuery } from '@tanstack/react-query';
import { Card, Tag, Button, Input, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { decksApi } from '../api/decks.api';

export function ExploreDecksPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['explore-decks'],
    queryFn: () => decksApi.getAll({ size: 20 }),
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#F4F3EE]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A]">Khám phá bộ thẻ</h1>
          <p className="text-gray-600 font-medium">Tìm kiếm hàng ngàn bộ flashcard chất lượng cao.</p>
        </div>
        <Input.Search 
          placeholder="Tìm kiếm bộ thẻ..." 
          className="max-w-md brutal-shadow-sm" 
          enterButton={
            <Button className="!bg-[#1D2A3A] !text-white brutal-pill font-bold px-6">TÌM KIẾM</Button>
          }
          size="large"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="brutal-card w-full h-[300px]">
              <Skeleton active />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.content?.map(deck => (
            <div 
              key={deck.id} 
              className="brutal-card brutal-shadow bg-white flex flex-col h-full overflow-hidden hover:-translate-y-1 transition-transform duration-200"
            >
              <div 
                className="h-40 bg-gray-200 border-b-[3px] border-black bg-cover bg-center"
                style={{ backgroundImage: `url(${deck.coverImageUrl || 'https://placehold.co/400x200/F4F3EE/1D2A3A?text=No+Image'})` }}
              />
              <div className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <Tag className="brutal-border font-bold m-0" color="#2A8B9D">
                    {deck.topic?.name || 'Chung'}
                  </Tag>
                  <span className="text-xs font-bold bg-[#F4F3EE] px-2 py-1 brutal-border">
                    {deck.totalCards} thẻ
                  </span>
                </div>
                
                <h3 className="text-xl font-bold leading-tight mb-2 line-clamp-2">{deck.title}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2 flex-1">{deck.description}</p>
                
                {/* Mock Rating UI */}
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-[#F05A4A] text-lg">★</span>
                  <span className="text-[#F05A4A] text-lg">★</span>
                  <span className="text-[#F05A4A] text-lg">★</span>
                  <span className="text-[#F05A4A] text-lg">★</span>
                  <span className="text-gray-300 text-lg">★</span>
                  <span className="text-xs font-bold text-gray-500 ml-1">(4.0)</span>
                </div>
                
                <Button 
                  className="w-full brutal-pill font-black uppercase tracking-wider h-10 mt-auto hover:!bg-[#F05A4A] hover:!text-white transition-colors"
                  onClick={() => navigate(`/study/${deck.id}`)}
                >
                  XEM CHI TIẾT
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && data?.content?.length === 0 && (
        <div className="text-center py-20 brutal-card bg-white">
          <h2 className="text-2xl font-bold">Không tìm thấy bộ thẻ nào.</h2>
        </div>
      )}
    </div>
  );
}
