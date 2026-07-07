import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'antd';

export function QuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  // Skeleton for Quiz Attempt interface
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const totalQuestions = 5; // Demo

  const handleSubmit = () => {
    // Submit quiz answers API call would go here
    navigate('/my-quiz-attempts');
  };

  const handleOptionSelect = (val: number) => {
    setSelectedOption(val);
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <Button onClick={() => navigate(-1)} className="brutal-border font-bold h-12 px-6">
            &larr; THOÁT
          </Button>
          <div className="text-xl font-bold brutal-border bg-white px-6 py-2 shadow-sm border-[3px]">
            Câu {currentQuestion + 1} / {totalQuestions}
          </div>
          <div className="text-xl font-black text-[#F05A4A] brutal-border bg-white px-6 py-2 shadow-sm border-[3px]">
            05:00
          </div>
        </div>

        <div className="brutal-card brutal-shadow bg-white p-8 mb-8">
          <h2 className="text-2xl font-black mb-8 leading-relaxed">
            Đây là nội dung câu hỏi số {currentQuestion + 1} cho Quiz #{quizId}?
          </h2>
          
          <div className="flex flex-col gap-4 w-full">
            {[1, 2, 3, 4].map((val) => (
              <label 
                key={val} 
                className={`
                  flex items-center gap-4 p-4 border-[3px] border-black cursor-pointer transition-all duration-200
                  ${selectedOption === val 
                    ? 'bg-[#2A8B9D] text-white brutal-shadow translate-y-[-2px]' 
                    : 'bg-[#F4F3EE] hover:bg-gray-200 shadow-none'
                  }
                `}
                onClick={() => handleOptionSelect(val)}
              >
                <div className={`
                  w-6 h-6 border-[3px] border-black rounded-full flex items-center justify-center
                  ${selectedOption === val ? 'bg-white' : 'bg-white'}
                `}>
                  {selectedOption === val && <div className="w-3 h-3 bg-black rounded-full" />}
                </div>
                <span className="text-lg font-bold flex-1">
                  Đáp án {String.fromCharCode(64 + val)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-4 mt-8">
          <Button 
            className="brutal-card h-14 px-8 font-black text-lg bg-white hover:-translate-y-1 transition-transform"
            disabled={currentQuestion === 0}
            onClick={() => {
              setCurrentQuestion(prev => prev - 1);
              setSelectedOption(null);
            }}
          >
            TRƯỚC
          </Button>

          {currentQuestion === totalQuestions - 1 ? (
            <Button 
              className="brutal-pill h-14 px-10 font-black text-lg uppercase !bg-[#F05A4A] !text-white hover:!translate-y-[-2px] transition-transform"
              onClick={handleSubmit}
            >
              NỘP BÀI
            </Button>
          ) : (
            <Button 
              className="brutal-pill h-14 px-10 font-black text-lg uppercase !bg-[#1D2A3A] !text-white hover:!translate-y-[-2px] transition-transform"
              onClick={() => {
                setCurrentQuestion(prev => prev + 1);
                setSelectedOption(null);
              }}
            >
              TIẾP TỤC
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
