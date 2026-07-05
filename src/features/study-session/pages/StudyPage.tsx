import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Skeleton } from 'antd';
import { flashcardsApi } from '../../study-content/api/flashcards.api';
// import { srsReviewsApi } from '../api/srs-reviews.api'; // To be integrated

export function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);

  // For demo, we just fetch all flashcards in the deck.
  // In a real flow, this should fetch CardProgress due today, then map to flashcards.
  const { data, isLoading } = useQuery({
    queryKey: ['study-cards', deckId],
    queryFn: () => flashcardsApi.getByDeckId(Number(deckId)),
    enabled: !!deckId,
  });

  const cards = data?.content || [];
  const currentCard = cards[currentIndex];

  const handleNext = (rating: number) => {
    // Here we would call srsReviewsApi.reviewCard({ cardId: currentCard.id, rating, ... })
    console.log('Rated', rating);
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowBack(false);
    } else {
      // Finished
      navigate('/my-decks');
    }
  };

  if (isLoading) {
    return <div className="p-8 max-w-2xl mx-auto"><Skeleton active /></div>;
  }

  if (cards.length === 0) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-20 brutal-card bg-white">
        <h2 className="text-2xl font-bold mb-4">Không có thẻ nào để học!</h2>
        <Button onClick={() => navigate('/my-decks')} className="brutal-border font-bold">Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F3EE] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => navigate('/my-decks')} className="brutal-border font-bold">&larr; THOÁT</Button>
          <div className="font-bold text-lg brutal-card bg-white px-4 py-1">
            Tiến độ: {currentIndex + 1} / {cards.length}
          </div>
        </div>

        <div 
          className="brutal-card bg-white min-h-[400px] flex flex-col items-center justify-center p-8 mb-8 cursor-pointer relative border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
          onClick={() => !showBack && setShowBack(true)}
        >
          {/* FRONT */}
          <div className="text-5xl font-black text-center mb-4 text-[#1D2A3A]">{currentCard.frontText}</div>
          {currentCard.phonetic && (
            <div className="text-2xl font-bold text-gray-500 mb-4 bg-gray-100 px-4 py-1 border-[3px] border-black">/{currentCard.phonetic}/</div>
          )}

          {/* BACK */}
          {showBack ? (
            <div className="mt-8 pt-8 border-t-[4px] border-black w-full flex flex-col items-center animate-fade-in">
              <div className="text-4xl font-black text-[#2A8B9D] mb-4 text-center">{currentCard.backText}</div>
              {currentCard.exampleText && (
                <div className="text-xl italic font-medium text-gray-700 text-center bg-[#F4F3EE] p-4 border-[3px] border-black mt-2">
                  "{currentCard.exampleText}"
                </div>
              )}
            </div>
          ) : (
            <div className="absolute bottom-6 bg-[#1D2A3A] text-white px-6 py-2 border-[3px] border-black font-black uppercase text-sm tracking-widest animate-pulse">
              [ NHẤN ĐỂ LẬT THẺ ]
            </div>
          )}
        </div>

        {showBack && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
            <Button onClick={() => handleNext(1)} className="h-16 brutal-border border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black !bg-[#ffcccc] hover:!bg-[#ff9999] text-[#cc0000] text-xl hover:-translate-y-1 transition-transform">LẠI</Button>
            <Button onClick={() => handleNext(2)} className="h-16 brutal-border border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black !bg-[#ffe6cc] hover:!bg-[#ffcc99] text-[#cc6600] text-xl hover:-translate-y-1 transition-transform">KHÓ</Button>
            <Button onClick={() => handleNext(3)} className="h-16 brutal-border border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black !bg-[#ccffcc] hover:!bg-[#99ff99] text-[#009900] text-xl hover:-translate-y-1 transition-transform">TỐT</Button>
            <Button onClick={() => handleNext(4)} className="h-16 brutal-border border-[3px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black !bg-[#cce5ff] hover:!bg-[#99ccff] text-[#0066cc] text-xl hover:-translate-y-1 transition-transform">DỄ</Button>
          </div>
        )}
      </div>
    </div>
  );
}
