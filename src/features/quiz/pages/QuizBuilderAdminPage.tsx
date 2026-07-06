import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import type { Control, UseFormRegister, UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { message, Switch } from 'antd';
import { quizzesApi } from '../api/quizzes.api';
import { decksApi } from '../../study-content/api/decks.api';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { apiClient } from '../../../shared/lib/api';

// --- Types ---
type OptionFormValues = {
  id?: number;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
};

type QuestionFormValues = {
  id?: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_THE_BLANK';
  points: number;
  displayOrder: number;
  questionImageUrl: string;
  explanation: string;
  isActive: boolean;
  options: OptionFormValues[];
};

type QuizFormValues = {
  quizCode: string;
  deckId: number;
  title: string;
  description: string;
  quizType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK' | 'MIXED';
  timeLimitSeconds: number | null;
  passScore: number;
  maxAttempts: number;
  shuffleQuestions: boolean;
  isActive: boolean;
  questions: QuestionFormValues[];
};

// --- Sub-component for Options ---
function QuestionOptions({
  control,
  register,
  questionIndex,
  qType,
  getValues,
}: {
  control: Control<QuizFormValues>;
  register: UseFormRegister<QuizFormValues>;
  questionIndex: number;
  qType: string;
  getValues: UseFormGetValues<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
}) {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`
  });

  useEffect(() => {
    if (qType === 'TRUE_FALSE') {
      const currentOpts = getValues(`questions.${questionIndex}.options`);
      const isAlreadyTF = currentOpts?.length === 2 && currentOpts[0]?.optionKey === 'True' && currentOpts[1]?.optionKey === 'False';
      if (!isAlreadyTF) {
        replace([
          { optionKey: 'True', optionText: 'Đúng', isCorrect: true, displayOrder: 1 },
          { optionKey: 'False', optionText: 'Sai', isCorrect: false, displayOrder: 2 }
        ]);
      }
    }
  }, [qType, questionIndex, replace, getValues]);

  const isTrueFalse = qType === 'TRUE_FALSE';

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-medium text-geist-gray-1000">Các lựa chọn đáp án</label>
        {!isTrueFalse && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ optionKey: '', optionText: '', isCorrect: false, displayOrder: fields.length + 1 })}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Thêm đáp án
          </Button>
        )}
      </div>
      <div className="space-y-3 flex-1">
        {fields.map((field, optionIndex) => (
          <div key={field.id} className="flex items-start gap-3 p-3 border border-geist-gray-300 rounded-lg bg-geist-bg-200 shadow-sm relative overflow-hidden">
            <div className="pt-2">
              <label className="relative inline-flex items-center cursor-pointer mt-1">
                <Controller
                  name={`questions.${questionIndex}.options.${optionIndex}.isCorrect`}
                  control={control}
                  render={({ field }) => (
                    <Switch size="small" checked={field.value} onChange={field.onChange} />
                  )}
                />
              </label>
            </div>
            <div className="flex-1 flex gap-2">
              <textarea
                placeholder="Nội dung đáp án"
                className="flex-1 bg-geist-bg-100 resize-none rounded-md border border-geist-gray-400 px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 transition-colors overflow-hidden"
                rows={1}
                readOnly={isTrueFalse}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                {...register(`questions.${questionIndex}.options.${optionIndex}.optionText`, { required: true })}
              />
              {!isTrueFalse && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-geist-gray-500 hover:text-geist-red-800"
                  onClick={() => remove(optionIndex)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-geist-gray-600 text-center py-8 bg-geist-bg-200 rounded-md border border-dashed border-geist-gray-300">
            Chưa có đáp án nào. Nhấn "Thêm đáp án" để bắt đầu.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Sub-component for individual Question ---
function QuestionCard({
  qField,
  qIndex,
  control,
  register,
  removeQuestion,
  errors,
  globalQuizType,
  getValues,
  setValue,
  onSaveSingleQuestion,
  isEditing
}: any) {
  const localType = useWatch({ control, name: `questions.${qIndex}.questionType`, defaultValue: qField.questionType });
  const qType = globalQuizType === 'MIXED' ? localType : (globalQuizType === 'FILL_BLANK' ? 'FILL_IN_THE_BLANK' : globalQuizType);

  // Sync forced type to form state on render if it's locked by global
  useEffect(() => {
    if (globalQuizType !== 'MIXED' && localType !== qType) {
      setValue(`questions.${qIndex}.questionType`, qType);
    }
  }, [globalQuizType, localType, qType, setValue, qIndex]);

  return (
    <div className="bg-geist-bg-100 border border-geist-gray-300 rounded-xl p-6 relative shadow-sm mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Question Details */}
        <div className="space-y-5 border-b lg:border-b-0 lg:border-r border-geist-gray-200 pb-6 lg:pb-0 lg:pr-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-geist-gray-1000 block">
                Nội dung câu hỏi <span className="text-geist-gray-500 font-mono text-xs ml-1">#{qIndex + 1}</span>
              </label>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-geist-gray-1000">
                  <span className="text-xs">Hoạt động</span>
                  <Controller
                    name={`questions.${qIndex}.isActive`}
                    control={control}
                    render={({ field }) => (
                      <Switch size="small" checked={field.value} onChange={field.onChange} />
                    )}
                  />
                </label>
                
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-geist-blue-700 hover:text-geist-blue-900 hover:bg-geist-blue-50 h-7 px-2"
                    onClick={() => onSaveSingleQuestion(qIndex)}
                    title="Lưu độc lập câu hỏi này"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" /> Lưu
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-geist-red-600 hover:text-geist-red-800 hover:bg-geist-red-50 -mr-2 h-7 px-2"
                  onClick={() => removeQuestion(qIndex)}
                  title="Xóa câu hỏi này"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Xóa
                </Button>
              </div>
            </div>
            <textarea
              {...register(`questions.${qIndex}.questionText`, { required: true })}
              className="flex w-full resize-none rounded-md border border-geist-gray-400 bg-geist-bg-50 px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors overflow-hidden"
              rows={2}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              placeholder="Nhập nội dung câu hỏi..."
            />
            {errors.questions?.[qIndex]?.questionText && <span className="text-xs text-geist-red-800">Bắt buộc</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Loại câu hỏi</label>
              <select
                {...register(`questions.${qIndex}.questionType`)}
                disabled={globalQuizType !== 'MIXED'}
                className="flex h-9 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-1.5 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors disabled:opacity-50 disabled:bg-geist-bg-200"
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
                <option value="FILL_IN_THE_BLANK">Điền vào chỗ trống</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-geist-gray-1000">Điểm</label>
                <Input type="number" {...register(`questions.${qIndex}.points`)} min="1" className="h-9 bg-transparent" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-geist-gray-1000">Thứ tự</label>
                <Input type="number" {...register(`questions.${qIndex}.displayOrder`)} min="0" className="h-9 bg-transparent" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Giải thích (Tùy chọn)</label>
            <textarea
              {...register(`questions.${qIndex}.explanation`)}
              className="flex w-full resize-none rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors overflow-hidden"
              rows={2}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
              placeholder="Giải thích chi tiết cho đáp án đúng..."
            />
          </div>

        </div>

        {/* Right Column: Options */}
        <div className="h-full">
          <QuestionOptions 
            control={control} 
            register={register} 
            questionIndex={qIndex} 
            qType={qType} 
            getValues={getValues}
            setValue={setValue}
          />
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export function QuizBuilderAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  // Single Question Save Mutation
  const saveSingleQuestionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { id: questionId, ...submitData } = payload;
      if (questionId) {
        const res = await apiClient.patch(`/quiz-questions/${questionId}`, submitData);
        return res.data;
      } else {
        const res = await apiClient.post('/quiz-questions', submitData);
        return res.data;
      }
    },
    onSuccess: () => {
      message.success('Đã lưu thành công câu hỏi');
      if (isEditing) {
        queryClient.invalidateQueries({ queryKey: ['admin-quiz-detail', id] });
      }
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Lỗi khi lưu câu hỏi');
    }
  });

  const handleSaveSingleQuestion = (qIndex: number) => {
    if (!isEditing) {
      message.error('Vui lòng lưu Bài kiểm tra (Lưu tất cả) trước khi lưu từng câu!');
      return;
    }
    
    const qData = getValues(`questions.${qIndex}`);
    
    const transformedOptions = (qData.options || []).map((opt: any, oIdx: number) => {
      const { id: _oid, ...optRest } = opt;
      const autoKey = qData.questionType === 'TRUE_FALSE' 
        ? (oIdx === 0 ? 'True' : 'False')
        : String.fromCharCode(65 + oIdx);
        
      return {
        ...optRest,
        optionKey: autoKey,
        displayOrder: Number(opt.displayOrder) || (oIdx + 1)
      };
    });
    
    const payload = {
      ...qData,
      quizId: Number(id),
      options: transformedOptions
    };
    
    saveSingleQuestionMutation.mutate(payload);
  };

  const { register, handleSubmit, control, reset, getValues, setValue, formState: { errors } } = useForm<QuizFormValues>({
    defaultValues: {
      quizType: 'MIXED', // 1. Mặc định là Hỗn hợp
      maxAttempts: 3,
      shuffleQuestions: true,
      isActive: true,
      passScore: 80,
      questions: []
    }
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: 'questions'
  });

  const watchQuizType = useWatch({ control, name: 'quizType' });

  const { data: decksData } = useQuery({
    queryKey: ['admin-decks'],
    queryFn: () => decksApi.getAll({ size: 100 }),
  });

  const { data: quizData, isLoading: isQuizLoading } = useQuery({
    queryKey: ['admin-quiz-detail', id],
    queryFn: () => quizzesApi.getById(Number(id)),
    enabled: isEditing,
  });

  // Populate form if editing
  useEffect(() => {
    if (isEditing && quizData?.data) {
      const q = quizData.data;
      reset({
        quizCode: q.quizCode,
        deckId: q.deckId,
        title: q.title,
        description: q.description || '',
        quizType: q.quizType,
        timeLimitSeconds: q.timeLimitSeconds || null,
        passScore: q.passScore || 80,
        maxAttempts: q.maxAttempts,
        shuffleQuestions: q.shuffleQuestions,
        isActive: q.isActive,
        questions: q.questions?.map(qItem => ({
          id: qItem.id,
          questionText: qItem.questionText,
          questionType: qItem.questionType as any,
          points: qItem.points,
          displayOrder: qItem.displayOrder,
          questionImageUrl: qItem.questionImageUrl || '',
          explanation: qItem.explanation || '',
          isActive: qItem.isActive,
          options: qItem.options?.map(opt => ({
            id: opt.id,
            optionKey: opt.optionKey,
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
            displayOrder: opt.displayOrder
          })) || []
        })) || []
      });
    }
  }, [isEditing, quizData, reset]);

  const saveMutation = useMutation({
    mutationFn: (values: QuizFormValues) =>
      isEditing
        ? quizzesApi.update(Number(id), { ...values, createdById: 1 })
        : quizzesApi.create({ ...values, createdById: 1 }),
    onSuccess: (res) => {
      message.success(isEditing ? 'Cập nhật bài kiểm tra thành công' : 'Tạo bài kiểm tra thành công');
      
      if (isEditing) {
        // Cập nhật lại cache chi tiết ngay lập tức
        queryClient.setQueryData(['admin-quiz-detail', id], res);
      }
      
      // Đánh dấu list quizzes là stale để lần tới mở trang danh sách sẽ tự fetch lại
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
      
      // Nếu là tạo mới, chuyển sang url edit để user tiếp tục sửa (không quay về list)
      if (!isEditing && res?.data?.id) {
        navigate(`/admin/quizzes/${res.data.id}/edit`, { replace: true });
      }
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const onSubmit = (values: QuizFormValues) => {
    // Basic type coercion
    values.deckId = Number(values.deckId);
    values.maxAttempts = Number(values.maxAttempts);
    values.passScore = Number(values.passScore);
    if (values.timeLimitSeconds) values.timeLimitSeconds = Number(values.timeLimitSeconds);
    
    // Ensure nested numbers and remove IDs for backend request
    const payload = {
      ...values,
      questions: values.questions.map((q, idx) => {
        return {
          ...q,
          points: Number(q.points),
          displayOrder: Number(q.displayOrder) || (idx + 1),
          options: q.options.map((opt, oIdx) => {
            // Tự động gán A, B, C, D... theo thứ tự nếu là trắc nghiệm
            const autoKey = q.questionType === 'TRUE_FALSE' 
              ? (oIdx === 0 ? 'True' : 'False')
              : String.fromCharCode(65 + oIdx);
              
            return {
              ...opt,
              optionKey: autoKey,
              displayOrder: Number(opt.displayOrder) || (oIdx + 1)
            };
          })
        };
      })
    };

    saveMutation.mutate(payload as any);
  };

  if (isEditing && isQuizLoading) {
    return <div className="p-8 text-center text-geist-gray-600">Đang tải cấu trúc bài kiểm tra...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-geist-bg-100 border-b border-geist-gray-300 pb-4 mb-8 pt-4 flex justify-between items-center shadow-sm -mx-6 px-6">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/quizzes')} className="text-geist-gray-700 p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000 flex items-baseline gap-2">
                {isEditing ? 'Chỉnh sửa Bài kiểm tra' : 'Tạo Bài kiểm tra mới'}
                <span className="text-lg text-geist-gray-500 font-normal">({questionFields.length} câu hỏi)</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/admin/quizzes')}>
              Hủy
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Đang lưu...' : 'Lưu tất cả'}
            </Button>
          </div>
        </div>

        {/* Quiz Metadata Section */}
        <section className="bg-geist-bg-200 border border-geist-gray-300 rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-medium text-geist-gray-1000 mb-6 pb-2 border-b border-geist-gray-200">
            Thông tin chung
          </h2>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Mã bài kiểm tra</label>
              <Input {...register('quizCode', { required: true })} placeholder="Ví dụ: QUIZ-001" />
              {errors.quizCode && <span className="text-xs text-geist-red-800">Bắt buộc</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Bộ thẻ (Deck)</label>
              <select
                {...register('deckId', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="">-- Chọn bộ thẻ --</option>
                {decksData?.content?.map((deck: any) => (
                  <option key={deck.id} value={deck.id}>{deck.title} (ID: {deck.id})</option>
                ))}
              </select>
              {errors.deckId && <span className="text-xs text-geist-red-800">Bắt buộc</span>}
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-geist-gray-1000">Tiêu đề bài kiểm tra</label>
            <Input {...register('title', { required: true })} placeholder="Nhập tiêu đề..." />
            {errors.title && <span className="text-xs text-geist-red-800">Bắt buộc</span>}
          </div>

          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium text-geist-gray-1000">Mô tả</label>
            <textarea
              {...register('description')}
              className="flex w-full resize-none rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors overflow-hidden"
              rows={2}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Loại bài kiểm tra</label>
              <select
                {...register('quizType', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="MIXED">Hỗn hợp (Cho phép nhiều dạng câu hỏi)</option>
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
                <option value="FILL_BLANK">Điền vào chỗ trống</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-geist-gray-1000">Thời gian (giây)</label>
                <Input type="number" {...register('timeLimitSeconds')} placeholder="Tùy chọn" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-geist-gray-1000">Điểm đỗ (0-100)</label>
                <Input type="number" {...register('passScore')} placeholder="80" min="0" max="100" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Số lần làm tối đa</label>
              <Input type="number" {...register('maxAttempts')} min="1" />
            </div>
            <div className="space-y-2 flex flex-col justify-center mt-6">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-geist-gray-1000">
                <Controller
                  name="shuffleQuestions"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={field.onChange} />
                  )}
                />
                Trộn câu hỏi
              </label>
            </div>
            <div className="space-y-2 flex flex-col justify-center mt-6">
              <label className="flex items-center gap-3 cursor-pointer text-sm font-medium text-geist-gray-1000">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onChange={field.onChange} />
                  )}
                />
                Hoạt động
              </label>
            </div>
          </div>
        </section>

        {/* Questions Builder Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-geist-gray-1000">Danh sách câu hỏi</h2>
              <p className="text-sm text-geist-gray-600 mt-1">Quản lý nội dung chi tiết của bài kiểm tra</p>
            </div>
            <Button
              type="button"
              onClick={() => {
                const defaultType = watchQuizType === 'MIXED' ? 'MULTIPLE_CHOICE' : 
                                   (watchQuizType === 'FILL_BLANK' ? 'FILL_IN_THE_BLANK' : watchQuizType);
                appendQuestion({
                  questionText: '',
                  questionType: defaultType as any,
                  points: 1,
                  displayOrder: questionFields.length + 1,
                  questionImageUrl: '',
                  explanation: '',
                  isActive: true,
                  options: defaultType === 'TRUE_FALSE' 
                    ? [
                        { optionKey: 'True', optionText: 'Đúng', isCorrect: true, displayOrder: 1 },
                        { optionKey: 'False', optionText: 'Sai', isCorrect: false, displayOrder: 2 }
                      ]
                    : [
                        { optionKey: 'A', optionText: '', isCorrect: true, displayOrder: 1 },
                        { optionKey: 'B', optionText: '', isCorrect: false, displayOrder: 2 }
                      ]
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm câu hỏi
            </Button>
          </div>

          <div className="space-y-0">
            {questionFields.map((qField, qIndex) => (
              <QuestionCard 
                key={qField.id}
                qField={qField}
                qIndex={qIndex}
                control={control}
                register={register}
                removeQuestion={removeQuestion}
                errors={errors}
                globalQuizType={watchQuizType}
                getValues={getValues}
                setValue={setValue}
                onSaveSingleQuestion={handleSaveSingleQuestion}
                isEditing={isEditing}
              />
            ))}
            
            {questionFields.length > 0 && (
              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const defaultType = watchQuizType === 'MIXED' ? 'MULTIPLE_CHOICE' : 
                                       (watchQuizType === 'FILL_BLANK' ? 'FILL_IN_THE_BLANK' : watchQuizType);
                    appendQuestion({
                      questionText: '',
                      questionType: defaultType as any,
                      points: 1,
                      displayOrder: questionFields.length + 1,
                      questionImageUrl: '',
                      explanation: '',
                      isActive: true,
                      options: defaultType === 'TRUE_FALSE' 
                        ? [
                            { optionKey: 'True', optionText: 'Đúng', isCorrect: true, displayOrder: 1 },
                            { optionKey: 'False', optionText: 'Sai', isCorrect: false, displayOrder: 2 }
                          ]
                        : [
                            { optionKey: 'A', optionText: '', isCorrect: true, displayOrder: 1 },
                            { optionKey: 'B', optionText: '', isCorrect: false, displayOrder: 2 }
                          ]
                    });
                  }}
                  className="w-full h-12 border-dashed border-2 border-geist-gray-300 text-geist-gray-600 hover:text-geist-gray-1000 hover:border-geist-gray-500 hover:bg-geist-bg-50"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Thêm câu hỏi tiếp theo
                </Button>
              </div>
            )}
            
            {questionFields.length === 0 && (
              <div className="p-12 border-2 border-dashed border-geist-gray-300 rounded-lg text-center bg-geist-bg-200">
                <p className="text-geist-gray-600 mb-4">Bài kiểm tra này chưa có câu hỏi nào.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const defaultType = watchQuizType === 'MIXED' ? 'MULTIPLE_CHOICE' : 
                                       (watchQuizType === 'FILL_BLANK' ? 'FILL_IN_THE_BLANK' : watchQuizType);
                    appendQuestion({
                      questionText: '',
                      questionType: defaultType as any,
                      points: 1,
                      displayOrder: 1,
                      questionImageUrl: '',
                      explanation: '',
                      isActive: true,
                      options: defaultType === 'TRUE_FALSE' 
                        ? [
                            { optionKey: 'True', optionText: 'Đúng', isCorrect: true, displayOrder: 1 },
                            { optionKey: 'False', optionText: 'Sai', isCorrect: false, displayOrder: 2 }
                          ]
                        : [
                            { optionKey: 'A', optionText: '', isCorrect: true, displayOrder: 1 },
                            { optionKey: 'B', optionText: '', isCorrect: false, displayOrder: 2 }
                          ]
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi đầu tiên
                </Button>
              </div>
            )}
          </div>
        </section>
      </form>
    </div>
  );
}
