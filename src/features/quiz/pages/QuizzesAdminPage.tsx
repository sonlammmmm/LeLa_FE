import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Settings2 } from 'lucide-react';
import { quizzesApi } from '../api/quizzes.api';
import { decksApi } from '../../study-content/api/decks.api';
import type { QuizResponse } from '../../../shared/types/lela';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { message, Modal as AntdModal } from 'antd'; // Keeping message for toast notifications
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Modal } from '../../../shared/components/ui/Modal';

type FormValues = {
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
};

const QUIZ_TYPE_MAP: Record<string, string> = {
  MULTIPLE_CHOICE: 'Trắc nghiệm',
  TRUE_FALSE: 'Đúng / Sai',
  FILL_BLANK: 'Điền vào chỗ trống',
  MIXED: 'Hỗn hợp',
};

export function QuizzesAdminPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizResponse | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      quizType: 'MULTIPLE_CHOICE',
      maxAttempts: 3,
      shuffleQuestions: true,
      isActive: true,
    }
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: () => quizzesApi.getAll({ size: 50 }),
  });

  const { data: decksData } = useQuery({
    queryKey: ['admin-decks'],
    queryFn: () => decksApi.getAll({ size: 100 }),
  });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => 
      editingQuiz 
        ? quizzesApi.update(editingQuiz.id, { ...values, createdById: 1 }) 
        : quizzesApi.create({ ...values, createdById: 1 }), // Assuming admin ID is 1 for now
    onSuccess: () => {
      message.success(editingQuiz ? 'Cập nhật bài kiểm tra thành công' : 'Tạo bài kiểm tra thành công');
      setIsModalOpen(false);
      reset();
      setEditingQuiz(null);
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizzesApi.delete(id),
    onSuccess: () => {
      message.success('Xóa bài kiểm tra thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // We reuse create mutation for bulk import since backend create was updated to cascade
        saveMutation.mutate(json);
      } catch (err) {
        message.error('File JSON không hợp lệ');
      }
    };
    reader.readAsText(file);
    // clear input
    e.target.value = '';
  };

  const openModal = (quiz?: QuizResponse) => {
    if (quiz) {
      setEditingQuiz(quiz);
      reset({
        quizCode: quiz.quizCode,
        deckId: quiz.deckId,
        title: quiz.title,
        description: quiz.description || '',
        quizType: quiz.quizType as any,
        timeLimitSeconds: quiz.timeLimitSeconds,
        passScore: quiz.passScore ?? 80,
        maxAttempts: quiz.maxAttempts,
        shuffleQuestions: quiz.shuffleQuestions,
        isActive: quiz.isActive
      });
    } else {
      setEditingQuiz(null);
      reset({
        quizCode: '', deckId: undefined, title: '', description: '',
        quizType: 'MULTIPLE_CHOICE', maxAttempts: 3, shuffleQuestions: true, isActive: true, timeLimitSeconds: null, passScore: 80
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    values.deckId = Number(values.deckId);
    values.maxAttempts = Number(values.maxAttempts);
    values.passScore = Number(values.passScore);
    if (values.timeLimitSeconds) values.timeLimitSeconds = Number(values.timeLimitSeconds);
    saveMutation.mutate(values);
  };

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000">Bài kiểm tra</h1>
          <p className="text-sm text-geist-gray-700 mt-1">Quản lý bài kiểm tra và bài tập</p>
        </div>
        <div className="flex gap-2">
          <div>
            <input 
              type="file" 
              accept=".json" 
              id="import-quiz-json" 
              className="hidden" 
              onChange={handleImportJson} 
            />
            <Button variant="outline" onClick={() => document.getElementById('import-quiz-json')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Import JSON
            </Button>
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm bài kiểm tra
          </Button>
        </div>
      </div>

      <div className="border border-geist-gray-400 rounded-lg bg-geist-bg-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-geist-gray-100 text-geist-gray-700 font-medium border-b border-geist-gray-300">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">ID Bộ thẻ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-geist-gray-300">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-geist-gray-600">Đang tải...</td></tr>
              ) : data?.data?.content?.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-geist-gray-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{quiz.quizCode}</td>
                  <td className="px-4 py-3 text-geist-gray-1000 font-medium">{quiz.title}</td>
                  <td className="px-4 py-3 text-geist-gray-1000">{QUIZ_TYPE_MAP[quiz.quizType] || quiz.quizType}</td>
                  <td className="px-4 py-3 text-geist-gray-1000">
                    {decksData?.content?.find((d: any) => d.id === quiz.deckId)?.title || quiz.deckId}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      quiz.isActive ? 'bg-geist-success-100 text-geist-success-800' : 'bg-geist-gray-200 text-geist-gray-800'
                    }`}>
                      {quiz.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/quizzes/${quiz.id}/questions`)}>
                        <Settings2 className="w-3.5 h-3.5 mr-1" />
                        Câu hỏi
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openModal(quiz)} title="Chỉnh sửa">
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
                            onOk: () => deleteMutation.mutate(quiz.id),
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
                <tr><td colSpan={6} className="px-4 py-8 text-center text-geist-gray-600">Không tìm thấy bài kiểm tra nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editingQuiz ? 'Chỉnh sửa bài kiểm tra' : 'Thêm bài kiểm tra'}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Mã bài kiểm tra</label>
              <Input {...register('quizCode', { required: true })} />
              {errors.quizCode && <span className="text-xs text-geist-red-800">Bắt buộc</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Bộ thẻ (Deck)</label>
              <select 
                {...register('deckId', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-geist-bg-100 px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="">-- Chọn bộ thẻ --</option>
                {decksData?.content?.map((deck: any) => (
                  <option key={deck.id} value={deck.id}>{deck.title} (ID: {deck.id})</option>
                ))}
              </select>
              {errors.deckId && <span className="text-xs text-geist-red-800">Bắt buộc</span>}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Tiêu đề</label>
            <Input {...register('title', { required: true })} />
            {errors.title && <span className="text-xs text-geist-red-800">Bắt buộc</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Mô tả</label>
            <textarea 
              {...register('description')} 
              className="flex w-full resize-none rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Loại bài kiểm tra</label>
              <select 
                {...register('quizType', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-geist-bg-100 px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="MULTIPLE_CHOICE">Trắc nghiệm</option>
                <option value="TRUE_FALSE">Đúng / Sai</option>
                <option value="FILL_BLANK">Điền vào chỗ trống</option>
                <option value="MIXED">Hỗn hợp</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-geist-gray-1000">Thời gian giới hạn (giây)</label>
                <Input type="number" {...register('timeLimitSeconds')} placeholder="Tùy chọn" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-geist-gray-1000">Điểm đỗ (0-100)</label>
                <Input type="number" {...register('passScore')} placeholder="80" min="0" max="100" />
              </div>
            </div>
            </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Số lần làm tối đa</label>
              <Input type="number" {...register('maxAttempts')} min="1" />
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <label className="text-sm font-medium text-geist-gray-1000 mb-2">Trộn câu hỏi</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-geist-gray-400 text-geist-blue-700 focus:ring-geist-blue-700 bg-transparent"
                  {...register('shuffleQuestions')}
                />
              </div>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <label className="text-sm font-medium text-geist-gray-1000 mb-2">Hoạt động</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-geist-gray-400 text-geist-blue-700 focus:ring-geist-blue-700 bg-transparent"
                  {...register('isActive')}
                />
              </div>
            </div>
          </div>
          
          
        </form>
      </Modal>
    </div>
  );
}
