import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Radio } from 'antd';

export function QuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  // Skeleton for Quiz Attempt interface
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const totalQuestions = 5; // Demo

  const handleSubmit = () => {
    // Submit quiz answers API call would go here
    navigate('/my-quiz-attempts');
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => navigate(-1)} className="brutal-border font-bold">&larr; THOÁT</Button>
          <div className="text-xl font-bold brutal-border bg-white px-4 py-2">
            Câu {currentQuestion + 1} / {totalQuestions}
          </div>
          <div className="text-xl font-bold text-red-600">
            05:00
          </div>
        </div>

        <div className="brutal-card bg-white p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Đây là nội dung câu hỏi số {currentQuestion + 1} cho Quiz #{quizId}?</h2>
          <Radio.Group className="flex flex-col gap-4 w-full">
            <Radio value={1} className="brutal-border p-4 w-full text-lg">Đáp án A</Radio>
            <Radio value={2} className="brutal-border p-4 w-full text-lg">Đáp án B</Radio>
            <Radio value={3} className="brutal-border p-4 w-full text-lg">Đáp án C</Radio>
            <Radio value={4} className="brutal-border p-4 w-full text-lg">Đáp án D</Radio>
          </Radio.Group>
        </div>

        <div className="flex justify-between">
          <Button 
            className="brutal-border h-12 px-8 font-bold"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(prev => prev - 1)}
          >
            TRƯỚC
          </Button>

          {currentQuestion === totalQuestions - 1 ? (
            <Button 
              className="brutal-border brutal-shadow !bg-[#F05A4A] !text-white h-12 px-8 font-bold uppercase"
              onClick={handleSubmit}
            >
              NỘP BÀI
            </Button>
          ) : (
            <Button 
              className="brutal-border brutal-shadow !bg-[#1D2A3A] !text-white h-12 px-8 font-bold uppercase"
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              SAU
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
