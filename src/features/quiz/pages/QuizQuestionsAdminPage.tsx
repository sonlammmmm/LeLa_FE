import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Modal as AntdModal } from 'antd'; // Keeping message for toast notifications
import { quizQuestionsApi } from '../api/quiz-questions.api';
import type { QuizQuestionResponse } from '../../../shared/types/lela';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Modal } from '../../../shared/components/ui/Modal';

type FormValues = {
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_THE_BLANK';
  points: number;
  displayOrder: number;
  questionImageUrl: string;
  explanation: string;
  isActive: boolean;
  options: {
    optionKey: string;
    optionText: string;
    isCorrect: boolean;
    displayOrder: number;
  }[];
};

const QUESTION_TYPE_MAP: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  TRUE_FALSE: 'Đúng / Sai',
  FILL_IN_THE_BLANK: 'Điền vào chỗ trống',
};

export function QuizQuestionsAdminPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionResponse | null>(null);
  
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      questionType: 'MULTIPLE_CHOICE',
      points: 1,
      displayOrder: 0,
      isActive: true,
      options: [
        { optionKey: 'A', optionText: '', isCorrect: true, displayOrder: 1 },
        { optionKey: 'B', optionText: '', isCorrect: false, displayOrder: 2 },
        { optionKey: 'C', optionText: '', isCorrect: false, displayOrder: 3 },
        { optionKey: 'D', optionText: '', isCorrect: false, displayOrder: 4 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options'
  });

  // The BE doesn't seem to have getByQuizId yet, so we filter getAll client-side or assume BE handles it via params
  const { data, isLoading } = useQuery({
    queryKey: ['admin-quiz-questions', quizId],
    queryFn: () => quizQuestionsApi.getAll({ quizId, size: 100 }), // Assumes backend can filter by quizId
  });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => 
      editingQuestion 
        ? quizQuestionsApi.update(editingQuestion.id, { ...values, quizId: Number(quizId) }) 
        : quizQuestionsApi.create({ ...values, quizId: Number(quizId) }),
    onSuccess: () => {
      message.success(editingQuestion ? 'Cập nhật câu hỏi thành công' : 'Tạo câu hỏi thành công');
      setIsModalOpen(false);
      reset();
      setEditingQuestion(null);
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions', quizId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizQuestionsApi.delete(id),
    onSuccess: () => {
      message.success('Xóa câu hỏi thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions', quizId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const openModal = (question?: QuizQuestionResponse) => {
    if (question) {
      setEditingQuestion(question);
      reset({
        questionText: question.questionText,
        questionType: question.questionType as any,
        points: question.points,
        displayOrder: question.displayOrder,
        questionImageUrl: question.questionImageUrl || '',
        explanation: question.explanation || '',
        isActive: question.isActive,
        options: question.options?.length ? question.options : [
          { optionKey: 'A', optionText: '', isCorrect: true, displayOrder: 1 },
          { optionKey: 'B', optionText: '', isCorrect: false, displayOrder: 2 }
        ]
      });
    } else {
      setEditingQuestion(null);
      reset({
        questionText: '', questionImageUrl: '', explanation: '',
        questionType: 'MULTIPLE_CHOICE', points: 1, displayOrder: 0, isActive: true,
        options: [
          { optionKey: 'A', optionText: '', isCorrect: true, displayOrder: 1 },
          { optionKey: 'B', optionText: '', isCorrect: false, displayOrder: 2 },
          { optionKey: 'C', optionText: '', isCorrect: false, displayOrder: 3 },
          { optionKey: 'D', optionText: '', isCorrect: false, displayOrder: 4 }
        ]
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    values.points = Number(values.points);
    values.displayOrder = Number(values.displayOrder);
    saveMutation.mutate(values);
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/quizzes')} className="text-geist-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại Bài kiểm tra
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000">
            Câu hỏi <span className="text-geist-gray-600 font-normal text-lg">/ Bài kiểm tra #{quizId}</span>
          </h1>
          <p className="text-sm text-geist-gray-700 mt-1">Quản lý các câu hỏi cho bài kiểm tra này</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm câu hỏi
        </Button>
      </div>

      <div className="border border-geist-gray-400 rounded-lg bg-geist-bg-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-geist-gray-100 text-geist-gray-700 font-medium border-b border-geist-gray-300">
              <tr>
                <th className="px-4 py-3">Thứ tự</th>
                <th className="px-4 py-3">Câu hỏi</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-geist-gray-300">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-geist-gray-600">Đang tải...</td></tr>
              ) : data?.data?.content?.map((question) => (
                <tr key={question.id} className="hover:bg-geist-gray-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{question.displayOrder}</td>
                  <td className="px-4 py-3 text-geist-gray-1000 font-medium whitespace-pre-wrap max-w-sm">{question.questionText}</td>
                  <td className="px-4 py-3 text-geist-gray-1000">{QUESTION_TYPE_MAP[question.questionType] || question.questionType}</td>
                  <td className="px-4 py-3 text-geist-gray-1000">{question.points}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(question)} title="Chỉnh sửa">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-geist-red-800 hover:text-geist-red-900 hover:bg-geist-red-100"
                        title="Xóa"
                        onClick={() => {
                          AntdModal.confirm({
                            title: 'Xác nhận xóa',
                            content: 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?',
                            okText: 'Xóa',
                            cancelText: 'Hủy',
                            okButtonProps: { danger: true },
                            onOk: () => deleteMutation.mutate(question.id),
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.data?.content || data.data.content.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-geist-gray-600">Không tìm thấy câu hỏi nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editingQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showCloseButton={false}
        headerActions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleSubmit(onSubmit)} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Nội dung câu hỏi</label>
            <textarea 
              {...register('questionText', { required: true })} 
              className="flex w-full resize-none rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              rows={3}
            />
            {errors.questionText && <span className="text-xs text-geist-red-800">Bắt buộc</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Loại câu hỏi</label>
              <select 
                {...register('questionType', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-geist-bg-100 px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
                <option value="FILL_IN_THE_BLANK">Điền vào chỗ trống</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Điểm</label>
              <Input type="number" {...register('points')} min="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Thứ tự hiển thị</label>
              <Input type="number" {...register('displayOrder')} min="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Đường dẫn ảnh (Tùy chọn)</label>
              <Input {...register('questionImageUrl')} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Giải thích</label>
            <textarea 
              {...register('explanation')} 
              className="flex w-full resize-none rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              rows={2}
            />
          </div>
          
          <div className="space-y-2 flex flex-col justify-center mt-2">
            <label className="text-sm font-medium text-geist-gray-1000 mb-2">Hoạt động</label>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-geist-gray-400 text-geist-blue-700 focus:ring-geist-blue-700 bg-transparent"
                {...register('isActive')}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-geist-gray-300">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-geist-gray-1000">Các lựa chọn đáp án</label>
              <Button type="button" variant="outline" size="sm" onClick={() => append({ optionKey: '', optionText: '', isCorrect: false, displayOrder: fields.length + 1 })}>
                <Plus className="w-4 h-4 mr-1" /> Thêm đáp án
              </Button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3 p-3 border border-geist-gray-300 rounded-lg bg-geist-bg-50">
                  <div className="pt-2">
                    <input
                      type="radio"
                      className="w-4 h-4 text-geist-blue-700 border-geist-gray-400 focus:ring-geist-blue-700 bg-transparent"
                      {...register(`options.${index}.isCorrect` as const)}
                      value="true"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="A, B, C..." 
                        className="w-16 text-center font-mono" 
                        {...register(`options.${index}.optionKey` as const, { required: true })} 
                      />
                      <Input 
                        placeholder="Nội dung đáp án" 
                        className="flex-1" 
                        {...register(`options.${index}.optionText` as const, { required: true })} 
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="text-geist-gray-500 hover:text-geist-red-800"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-sm text-geist-gray-600 text-center py-4">Chưa có đáp án nào.</p>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
