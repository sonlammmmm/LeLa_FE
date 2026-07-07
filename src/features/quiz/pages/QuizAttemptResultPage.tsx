import { useParams, useNavigate } from 'react-router-dom';
import { Button, Skeleton, App, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { quizAttemptsApi } from '../api/quiz-attempts.api';

export function QuizAttemptResultPage() {
  const { publicId } = useParams<{ publicId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const { data: attemptRes, isLoading, isError } = useQuery({
    queryKey: ['attemptDetail', publicId],
    queryFn: () => quizAttemptsApi.getAttemptDetail(publicId!),
    enabled: !!publicId
  });

  if (isError) {
    message.error('Không thể tải dữ liệu kết quả bài thi.');
    return <div className="min-h-screen bg-[#F4F3EE] p-8 max-w-3xl mx-auto"><h2 className="text-2xl font-bold text-red-500">Đã xảy ra lỗi</h2></div>;
  }

  if (isLoading || !attemptRes) {
    return <div className="min-h-screen bg-[#F4F3EE] p-8 max-w-3xl mx-auto"><Skeleton active paragraph={{ rows: 10 }} /></div>;
  }

  const attemptData = attemptRes.data;
  const questions = attemptData.questions || [];
  const answers = attemptData.answers || [];

  const getAnswerForQuestion = (questionId: number) => {
    return answers.find((a: any) => a.attemptQuestionId === questionId);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F3EE] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <Button onClick={() => navigate('/my-quiz-attempts')} className="brutal-border font-bold h-12 px-6 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 transition-transform">
            &larr; LỊCH SỬ THI
          </Button>
          <div className="text-xl font-bold brutal-border bg-white px-6 py-2 shadow-[2px_2px_0px_0px_#000] border-[3px]">
            Kết quả: {attemptData.quizTitle}
          </div>
          <Button 
            className="brutal-border font-bold h-12 px-6 !bg-[#1D2A3A] !text-white shadow-[2px_2px_0px_0px_#000] hover:!translate-y-[-2px] transition-transform"
            onClick={() => navigate(`/quiz/${attemptData.quizId}/start`)}
          >
            LÀM LẠI BÀI NÀY
          </Button>
        </div>

        {/* Score Summary Card */}
        <div className="brutal-card bg-white p-6 md:p-10 mb-8 border-[3px] border-black shadow-[6px_6px_0px_0px_#000] flex flex-col items-center">
          <h2 className="text-3xl font-black mb-4 text-[#1D2A3A] uppercase">Tổng kết bài làm</h2>
          
          <div className="flex flex-wrap gap-8 justify-center items-center w-full my-6">
            <div className="flex flex-col items-center">
              <span className="text-gray-500 font-bold mb-1">Điểm số</span>
              <span className="text-5xl font-black" style={{ color: attemptData.passed ? '#2A8B9D' : '#F05A4A' }}>
                {Number(attemptData.scorePercent || 0).toFixed(0)}%
              </span>
            </div>
            
            <div className="w-[3px] h-16 bg-black hidden md:block"></div>
            
            <div className="flex flex-col items-center">
              <span className="text-gray-500 font-bold mb-1">Số câu đúng</span>
              <span className="text-4xl font-black text-[#1D2A3A]">
                {attemptData.correctAnswers} / {attemptData.totalQuestions}
              </span>
            </div>

            <div className="w-[3px] h-16 bg-black hidden md:block"></div>

            <div className="flex flex-col items-center">
              <span className="text-gray-500 font-bold mb-1">Thời gian làm</span>
              <span className="text-4xl font-black text-[#1D2A3A]">
                {formatTime(attemptData.timeSpentSeconds)}
              </span>
            </div>
          </div>

          <Tag color={attemptData.passed ? '#2A8B9D' : '#F05A4A'} className="brutal-border font-black text-xl px-8 py-2 mt-2">
            {attemptData.passed ? 'ĐẠT' : 'CHƯA ĐẠT'}
          </Tag>
        </div>

        {/* Questions Detail */}
        <h3 className="text-2xl font-black mb-6 uppercase text-[#1D2A3A]">Chi tiết đáp án</h3>
        
        {questions.map((q: any, index: number) => {
          const answer = getAnswerForQuestion(q.id);
          const isCorrect = answer?.isCorrect;

          return (
            <div key={q.id} className="brutal-card bg-white p-6 md:p-8 mb-6 border-[3px] border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h4 className="text-xl md:text-2xl font-bold leading-relaxed text-[#1D2A3A]">
                  <span className="mr-2">Câu {index + 1}:</span>
                  {q.questionText}
                </h4>
                <div>
                  <Tag color={isCorrect ? '#2A8B9D' : '#F05A4A'} className="brutal-border font-bold px-3 py-1 text-base m-0">
                    {isCorrect ? 'Đúng' : 'Sai'}
                  </Tag>
                </div>
              </div>

              {q.questionImageUrl && (
                <img src={q.questionImageUrl} alt="Question" className="max-w-full h-auto mb-6 brutal-border border-[3px] border-black" />
              )}

              <div className="flex flex-col gap-4 w-full">
                {q.questionType === 'FILL_BLANK' ? (
                  <div className="flex flex-col gap-2">
                    <div className={`p-4 border-[3px] border-black font-bold text-lg ${isCorrect ? 'bg-[#e6f4f1]' : 'bg-[#fdebea]'}`}>
                      Bạn trả lời: <span className={isCorrect ? 'text-[#2A8B9D]' : 'text-[#F05A4A]'}>{answer?.answerText || '(Trống)'}</span>
                    </div>
                    {!isCorrect && (
                      <div className="p-4 border-[3px] border-black font-bold text-lg bg-[#e6f4f1]">
                        Đáp án đúng: <span className="text-[#2A8B9D]">
                          {q.options?.filter((o: any) => o.isCorrect).map((o: any) => o.optionText).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  q.options?.map((opt: any) => {
                    const isSelected = answer?.selectedAttemptOptionId === opt.id;
                    const isCorrectOption = opt.isCorrect === true;
                    
                    let optionClasses = 'bg-[#F4F3EE]';
                    let textClasses = 'text-[#1D2A3A]';
                    
                    if (isCorrectOption) {
                      optionClasses = 'bg-[#2A8B9D] text-white shadow-[2px_2px_0px_0px_#000]';
                      textClasses = 'text-white';
                    } else if (isSelected && !isCorrectOption) {
                      optionClasses = 'bg-[#F05A4A] text-white shadow-[2px_2px_0px_0px_#000]';
                      textClasses = 'text-white';
                    }

                    return (
                      <div 
                        key={opt.id} 
                        className={`
                          flex items-center gap-4 p-4 md:p-5 border-[3px] border-black transition-all duration-200
                          ${optionClasses}
                        `}
                      >
                        <div className={`
                          w-8 h-8 border-[3px] border-black rounded-full flex items-center justify-center shrink-0 bg-white
                        `}>
                          {isSelected && <div className="w-4 h-4 bg-black rounded-full" />}
                        </div>
                        <span className={`text-xl font-bold flex-1 ${textClasses}`}>
                          {opt.optionText}
                        </span>
                        {isSelected && <span className={`font-bold ml-2 ${textClasses}`}>(Đã chọn)</span>}
                        {isCorrectOption && !isSelected && <span className={`font-bold ml-2 ${textClasses}`}>(Đáp án đúng)</span>}
                      </div>
                    );
                  })
                )}
              </div>

              {q.explanation && (
                <div className="mt-6 p-4 bg-gray-100 border-[3px] border-black border-dashed">
                  <h5 className="font-bold text-lg mb-2">Giải thích:</h5>
                  <p className="text-gray-700">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
