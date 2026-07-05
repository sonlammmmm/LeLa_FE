import { Button } from "antd";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onAction?: (path: string) => void;
}

export function HeroSection({ onAction }: Props) {
  return (
    <section className="relative w-full pt-16 md:pt-24 pb-16">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
          
          {/* Left: Text Content */}
          <div className="flex flex-col items-start space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-brand-navy">
              Học Từ Vựng.<br />
              <span className="text-brand-coral">Không Nhàm Chán.</span>
            </h1>
            
            <p className="max-w-[480px] text-lg font-medium text-brand-navy/80 leading-relaxed">
              Ứng dụng flashcard lặp lại ngắt quãng giúp bạn nhớ từ vựng lâu hơn và tốn ít thời gian ôn tập hơn.
            </p>
            
            <div className="pt-2">
              <Button 
                onClick={() => onAction?.('/login')}
                type="primary" 
                size="large" 
                className="h-14 px-8 text-lg font-bold brutal-shadow brutal-border brutal-pill bg-brand-coral text-white hover:bg-brand-teal transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000000]"
                icon={<ArrowRight className="w-5 h-5 ml-2" />}
                iconPlacement="end"
              >
                Bắt Đầu Ngay
              </Button>
            </div>
          </div>

          {/* Right: Visual Asset */}
          <motion.div 
            initial={{ opacity: 0, y: 24, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="relative w-full max-w-[600px] mx-auto lg:ml-auto"
          >
            <div className="aspect-[4/3] w-full overflow-hidden brutal-border brutal-shadow brutal-card bg-brand-teal relative group cursor-pointer" onClick={() => onAction?.('#demo')}>
              <img 
                src="/images/hero_youth_learning.png" 
                alt="Sinh viên học ngoại ngữ với flashcard" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-brand-teal/10 mix-blend-multiply" />
            </div>
            
            {/* Mascot float (The Fox) */}
            <motion.div 
              animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              className="absolute -top-12 -right-12 w-32 h-32 z-20 flex items-center justify-center drop-shadow-xl"
            >
              <img src="/images/lela_fox_logo.png" alt="LeLa Fox Mascot" className="w-full h-full object-contain" />
            </motion.div>

            {/* Decorative element */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
              className="absolute -bottom-6 -left-6 w-28 h-28 bg-brand-navy brutal-pill flex items-center justify-center brutal-border brutal-shadow z-10"
            >
              <span className="text-brand-offwhite font-black text-center text-sm leading-tight tracking-widest">
                HỌC<br/>THÔNG<br/>MINH
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
