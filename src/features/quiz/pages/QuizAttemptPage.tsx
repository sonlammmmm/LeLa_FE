import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Skeleton, Input, App } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { quizAttemptsApi } from '../api/quiz-attempts.api';

interface QuizAnswerSubmitRequest {
  attemptQuestionId: number;
  selectedAttemptOptionId?: number;
  answerText?: string;
}

export function QuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, QuizAnswerSubmitRequest>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: attemptRes, isLoading: isStarting, isError: isStartError } = useQuery({
    queryKey: ['startAttempt', quizId],
    queryFn: () => quizAttemptsApi.startAttempt(Number(quizId)),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: Infinity, // Prevent refetching unless invalidated
  });

  const attemptData = attemptRes?.data;

  useEffect(() => {
    if (attemptData?.timeLimitSeconds) {
      setTimeLeft(attemptData.timeLimitSeconds);
    }
  }, [attemptData]);

  useEffect(() => {
    if (isStartError) {
      message.error('Không thể bắt đầu bài kiểm tra.');
      navigate(-1);
    }
  }, [isStartError, navigate]);

  const submitMutation = useMutation({
    mutationFn: (data: any) => quizAttemptsApi.submitAttempt(attemptData.id, data),
    onSuccess: () => {
      message.success('Nộp bài thành công!');
      // Navigate to Result detail instead of My attempts
      navigate(`/quiz-attempts/${attemptData.publicId}/result`, { replace: true });
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi nộp bài.');
    }
  });



  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto submit when time is up
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    const answersList = Object.values(answers);
    submitMutation.mutate({ answers: answersList });
  };

  const handleOptionSelect = (questionId: number, optionId: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        attemptQuestionId: questionId,
        selectedAttemptOptionId: optionId
      }
    }));
  };

  const handleTextAnswer = (questionId: number, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        attemptQuestionId: questionId,
        answerText: text
      }
    }));
  };

  if (isStarting || !attemptData) {
    return <div className="min-h-screen bg-[#F4F3EE] p-8 max-w-3xl mx-auto"><Skeleton active paragraph={{ rows: 10 }} /></div>;
  }

  const questions = attemptData.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div className="min-h-screen bg-[#F4F3EE] p-8 text-center"><h2 className="text-2xl font-bold">Không có câu hỏi nào.</h2></div>;
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <Button onClick={() => navigate(-1)} className="brutal-border font-bold h-12 px-6 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 transition-transform">
            &larr; THOÁT
          </Button>
          <div className="text-xl font-bold brutal-border bg-white px-6 py-2 shadow-[2px_2px_0px_0px_#000] border-[3px]">
            Câu {currentQuestionIndex + 1} / {totalQuestions}
          </div>
          {timeLeft !== null && (
            <div className={`text-xl font-black brutal-border bg-white px-6 py-2 shadow-[2px_2px_0px_0px_#000] border-[3px] ${timeLeft < 60 ? 'text-[#F05A4A] animate-pulse' : 'text-[#1D2A3A]'}`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        <div className="brutal-card bg-white p-6 md:p-10 mb-8 border-[3px] border-black shadow-[6px_6px_0px_0px_#000]">
          <h2 className="text-2xl md:text-3xl font-black mb-8 leading-relaxed text-[#1D2A3A]">
            {currentQuestion.questionText}
          </h2>
          {currentQuestion.questionImageUrl && (
            <img src={currentQuestion.questionImageUrl} alt="Question" className="max-w-full h-auto mb-8 brutal-border border-[3px] border-black" />
          )}
          
          <div className="flex flex-col gap-4 w-full">
            {currentQuestion.questionType === 'FILL_BLANK' ? (
              <Input 
                size="large"
                placeholder="Nhập câu trả lời của bạn..."
                className="brutal-border border-[3px] border-black h-16 text-xl px-4 focus:ring-0 focus:border-black font-bold"
                value={currentAnswer?.answerText || ''}
                onChange={(e) => handleTextAnswer(currentQuestion.id, e.target.value)}
              />
            ) : (
              currentQuestion.options?.map((opt: any) => {
                const isSelected = currentAnswer?.selectedAttemptOptionId === opt.id;
                return (
                  <label 
                    key={opt.id} 
                    className={`
                      flex items-center gap-4 p-4 md:p-5 border-[3px] border-black cursor-pointer transition-all duration-200 select-none
                      ${isSelected 
                        ? 'bg-[#2A8B9D] text-white shadow-[2px_2px_0px_0px_#000] translate-y-[-2px]' 
                        : 'bg-[#F4F3EE] hover:bg-gray-200 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000]'
                      }
                    `}
                    onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                  >
                    <div className={`
                      w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center shrink-0
                      ${isSelected ? 'bg-white' : 'bg-white'}
                    `}>
                      {isSelected && <div className="w-4 h-4 bg-black rounded-full" />}
                    </div>
                    <span className="text-xl font-bold flex-1">
                      {opt.optionText}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 mt-8">
          <Button 
            className="brutal-card h-14 px-8 font-black text-lg bg-white hover:-translate-y-1 transition-transform border-[3px] border-black shadow-[4px_4px_0px_0px_#000]"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          >
            QUAY LẠI
          </Button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button 
              className="brutal-pill h-14 px-12 font-black text-xl uppercase !bg-[#F05A4A] !text-white hover:!translate-y-[-2px] transition-transform shadow-[4px_4px_0px_0px_#000] border-[3px] border-black"
              onClick={handleSubmit}
              loading={submitMutation.isPending}
            >
              NỘP BÀI
            </Button>
          ) : (
            <Button 
              className="brutal-pill h-14 px-12 font-black text-xl uppercase !bg-[#1D2A3A] !text-white hover:!translate-y-[-2px] transition-transform shadow-[4px_4px_0px_0px_#000] border-[3px] border-black"
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            >
              TIẾP TỤC
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
