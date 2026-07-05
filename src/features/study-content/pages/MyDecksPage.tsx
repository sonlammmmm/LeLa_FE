import { useQuery } from '@tanstack/react-query';
import { Card, Button, Skeleton, message } from 'antd';
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { deckEnrollmentsApi } from '../api/deck-enrollments.api';
import { decksApi } from '../api/decks.api';
import { flashcardsApi } from '../api/flashcards.api';

// Mapped Component to fetch the real Deck details for each enrollment
function EnrolledDeckCard({ deckId, status, masteredCards }: { deckId: number, status: string, masteredCards: number }) {
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(() => {
    return !!localStorage.getItem(`lela_offline_deck_${deckId}`);
  });

  const { data, isLoading } = useQuery({
    queryKey: ['deck', deckId],
    queryFn: () => decksApi.getById(deckId),
  });

  if (isLoading) {
    return <Card className="brutal-card h-[250px]"><Skeleton active /></Card>;
  }

  const deck = data;
  if (!deck) return null;

  const handleDownloadOffline = async () => {
    try {
      setIsDownloading(true);
      const res = await flashcardsApi.getByDeckId(deckId, { size: 10000 });
      // flashcardsApi returns Page<FlashcardResponse> directly or ApiResponse wrapped depending on the setup.
      // Based on TS error, it expects Page<FlashcardResponse> so it has .content
      // However, if it actually is ApiResponse at runtime, we should handle both.
      const cards = (res as any)?.data?.content || (res as any)?.content;
      if (cards) {
        localStorage.setItem(`lela_offline_deck_${deckId}`, JSON.stringify(cards));
        setIsOfflineReady(true);
        message.success('Đã tải bộ thẻ để học offline!');
      }
    } catch (error) {
      message.error('Tải offline thất bại!');
    } finally {
      setIsDownloading(false);
    }
  };

  const progressPercent = deck.totalCards > 0 ? Math.round((masteredCards / deck.totalCards) * 100) : 0;

  return (
    <div className="brutal-card bg-white flex flex-col h-full overflow-hidden">
      <div 
        className="h-32 bg-gray-200 border-b-4 border-black bg-cover bg-center relative"
        style={{ backgroundImage: `url(${deck.coverImageUrl || 'https://via.placeholder.com/400x200?text=No+Image'})` }}
      >
        <div className="absolute top-2 right-2 bg-[#F4F3EE] px-2 py-1 brutal-border text-xs font-bold uppercase">
          {status}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-xl font-bold leading-tight mb-2 line-clamp-1">{deck.title}</h3>
        
        <div className="mb-4 mt-2">
          <div className="flex justify-between text-xs font-bold text-gray-700 mb-1 uppercase">
            <span>Tiến độ</span>
            <span>{masteredCards} / {deck.totalCards} thẻ ({progressPercent}%)</span>
          </div>
          <div className="h-4 w-full bg-[#F4F3EE] border-[2px] border-black overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div 
              className="h-full bg-[#2A8B9D] border-r-[2px] border-black transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <Button 
            className="flex-1 brutal-border brutal-shadow-sm font-black uppercase h-10 !bg-[#1D2A3A] !text-white hover:!translate-y-[-2px]"
            onClick={() => navigate(`/study/${deck.id}`)}
          >
            HỌC TIẾP
          </Button>
          <Button 
            className="brutal-border font-bold h-10 px-3 flex items-center justify-center bg-white"
            icon={isOfflineReady ? <CheckCircleOutlined className="text-[#2A8B9D] text-lg" /> : <DownloadOutlined className="text-lg" />}
            loading={isDownloading}
            onClick={handleDownloadOffline}
            title="Tải Offline"
          />
        </div>
      </div>
    </div>
  );
}

export function MyDecksPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => deckEnrollmentsApi.getMyList({ size: 50 }),
  });

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-[#F4F3EE]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1D2A3A]">Bộ thẻ của tôi</h1>
          <p className="text-gray-600 font-medium mt-1">Danh sách các bộ thẻ bạn đang theo học.</p>
        </div>
        <Button 
          type="primary"
          onClick={() => navigate('/decks')}
          className="brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white h-12 px-6 font-bold uppercase"
        >
          TÌM BỘ THẺ MỚI
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <Card className="brutal-card h-[250px]"><Skeleton active /></Card>
          <Card className="brutal-card h-[250px]"><Skeleton active /></Card>
        </div>
      ) : (
        <>
          {data?.data?.content?.length === 0 ? (
            <div className="text-center py-20 brutal-card bg-white">
              <h2 className="text-2xl font-bold mb-4">Bạn chưa học bộ thẻ nào!</h2>
              <Button 
                onClick={() => navigate('/decks')}
                className="brutal-border font-bold h-12 px-6"
              >
                Khám phá ngay
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {data?.data?.content?.map(enrollment => (
                <EnrolledDeckCard 
                  key={enrollment.id} 
                  deckId={enrollment.deckId} 
                  status={enrollment.status}
                  masteredCards={enrollment.masteredCards || 0}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
