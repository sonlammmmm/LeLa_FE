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
          className="brutal-card bg-white min-h-[400px] flex flex-col items-center justify-center p-8 mb-8 cursor-pointer relative"
          onClick={() => !showBack && setShowBack(true)}
        >
          {/* FRONT */}
          <div className="text-4xl font-black text-center mb-4">{currentCard.frontText}</div>
          {currentCard.phonetic && (
            <div className="text-xl text-gray-500 mb-4">/{currentCard.phonetic}/</div>
          )}

          {/* BACK */}
          {showBack ? (
            <div className="mt-8 pt-8 border-t-4 border-black w-full flex flex-col items-center animate-fade-in">
              <div className="text-3xl font-bold text-[#2A8B9D] mb-4 text-center">{currentCard.backText}</div>
              {currentCard.exampleText && (
                <div className="text-lg italic text-gray-700 text-center">{currentCard.exampleText}</div>
              )}
            </div>
          ) : (
            <div className="absolute bottom-4 text-gray-400 font-bold animate-pulse">
              [ NHẤN ĐỂ LẬT THẺ ]
            </div>
          )}
        </div>

        {showBack && (
          <div className="grid grid-cols-4 gap-4 animate-fade-in">
            <Button onClick={() => handleNext(1)} className="h-16 brutal-border brutal-shadow font-black !bg-red-200 text-red-900 text-lg">LẠI</Button>
            <Button onClick={() => handleNext(2)} className="h-16 brutal-border brutal-shadow font-black !bg-orange-200 text-orange-900 text-lg">KHÓ</Button>
            <Button onClick={() => handleNext(3)} className="h-16 brutal-border brutal-shadow font-black !bg-green-200 text-green-900 text-lg">TỐT</Button>
            <Button onClick={() => handleNext(4)} className="h-16 brutal-border brutal-shadow font-black !bg-blue-200 text-blue-900 text-lg">DỄ</Button>
          </div>
        )}
      </div>
    </div>
  );
}
