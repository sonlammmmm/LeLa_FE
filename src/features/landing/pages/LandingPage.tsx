import { HeroSection } from "../components/HeroSection";
import { BentoFeatures } from "../components/BentoFeatures";
import { FlashcardDemo } from "../components/FlashcardDemo";
import { CtaSection } from "../components/CtaSection";
import { BackgroundPattern } from "../components/BackgroundPattern";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

// We assume the asset is available to import
import bubblePopSound from "../../../assets/sounds/bubble-pop.mp3";

export function LandingPage() {
  const navigate = useNavigate();
  
  const playSound = () => {
    const audio = new Audio(bubblePopSound);
    audio.play().catch(e => console.error("Audio play failed", e));
  };

  const handleNav = (path: string) => {
    playSound();
    if (path.startsWith('#')) {
       document.querySelector(path)?.scrollIntoView({ behavior: 'smooth' });
    } else {
       navigate(path);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-offwhite relative font-sans">
      <BackgroundPattern />
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full bg-brand-offwhite/90 backdrop-blur border-b-[3px] border-brand-black">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNav('/')}>
            {/* Logo from brand kit (The Fox) */}
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/images/lela_fox_logo.png" alt="LeLa Fox Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <span className="text-2xl font-black text-brand-navy tracking-tight ml-2">LeLa</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-bold">
            <a href="#features" className="!text-brand-navy hover:!text-[#006bff] transition-colors" onClick={(e) => { e.preventDefault(); handleNav('#features'); }}>Tính năng</a>
            <a href="#demo" className="!text-brand-navy hover:!text-[#006bff] transition-colors" onClick={(e) => { e.preventDefault(); handleNav('#demo'); }}>Dùng thử</a>
            <a href="/decks" className="!text-brand-navy hover:!text-[#006bff] transition-colors" onClick={(e) => { e.preventDefault(); handleNav('/decks'); }}>Khám phá</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button onClick={() => handleNav('/login')} className="hidden md:inline-flex font-bold brutal-border brutal-pill bg-white text-brand-navy hover:-translate-y-0.5 transition-transform">
              Đăng nhập
            </Button>
            <Button 
              onClick={() => handleNav('/register')}
              type="primary" 
              className="font-bold brutal-border brutal-pill bg-brand-coral text-white hover:-translate-y-0.5 transition-transform"
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <HeroSection onAction={handleNav} />
        <div id="features">
          <BentoFeatures />
        </div>
        <div id="demo">
          <FlashcardDemo playSound={playSound} />
        </div>
        <CtaSection onAction={handleNav} />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white py-12 border-t-[3px] border-brand-black relative z-10">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center">
          <div className="text-brand-navy font-bold text-lg mb-4 md:mb-0">
            LeLa - Học ngoại ngữ bằng Flashcard
          </div>
          <div className="text-brand-navy/60 font-medium">
            © 2026 LeLa Project. Soft Brutalism design.
          </div>
        </div>
      </footer>

    </div>
  );
}
