import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Repeat, Volume2 } from "lucide-react";

interface Props {
  playSound?: () => void;
}

export function FlashcardDemo({ playSound }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const reduce = useReducedMotion();

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (playSound) playSound();
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playSound) playSound();
  };

  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    e.preventDefault();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section className="w-full py-24 relative">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="flex flex-col space-y-6">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-navy">
              Học là phải thực hành.
            </h2>
            <p className="text-lg font-medium text-brand-navy/80 max-w-[400px]">
              Trải nghiệm thẻ học tương tác. Nhấp vào thẻ để lật và tự đánh giá mức độ thuộc bài của bạn.
            </p>
            <div className="flex items-center text-sm font-bold text-brand-teal uppercase tracking-widest mt-4">
              <Repeat className="w-4 h-4 mr-2" />
              Tương tác ngay
            </div>
          </div>

          <div className="flex justify-center md:justify-end [perspective:1000px]">
            <motion.div
              className="relative w-full max-w-[340px] aspect-[3/4] cursor-pointer group"
              onClick={handleFlip}
              initial={false}
              animate={{ rotateY: isFlipped && !reduce ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 brutal-card bg-white p-8 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden" }}
              >
                <button
                  className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-[#2A8B9D] hover:bg-[#1D2A3A] active:translate-y-1 active:shadow-[2px_2px_0px_0px_#000] border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white rounded-full transition-all cursor-pointer z-10"
                  onClick={(e) => handleSpeak(e, 'Serendipity')}
                  title="Phát âm"
                >
                  <Volume2 className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <div className="text-sm font-bold text-brand-navy/50 mb-auto tracking-widest uppercase">
                  Vocabulary
                </div>
                <div className="text-5xl font-extrabold text-brand-navy mb-4">
                  Serendipity
                </div>
                <div className="text-lg font-medium text-brand-navy/60 mt-auto">
                  Chạm để lật thẻ
                </div>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 brutal-card bg-brand-coral p-8 flex flex-col items-center justify-center text-center"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="text-sm font-bold text-white/70 mb-auto tracking-widest uppercase">
                  Definition
                </div>
                <div className="text-3xl font-extrabold text-white mb-6">
                  Sự tình cờ may mắn
                </div>
                <div className="text-lg font-medium text-white/90">
                  (n) The occurrence and development of events by chance in a happy or beneficial way.
                </div>
                <div className="mt-auto pt-6 flex w-full gap-2 justify-between">
                  <button onClick={handleAction} className="flex-1 bg-white brutal-border brutal-pill py-2 text-xs font-bold text-brand-navy hover:bg-brand-offwhite hover:-translate-y-1 transition-transform">
                    QUÊN
                  </button>
                  <button onClick={handleAction} className="flex-1 bg-white brutal-border brutal-pill py-2 text-xs font-bold text-brand-navy hover:bg-brand-offwhite hover:-translate-y-1 transition-transform">
                    NHỚ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
