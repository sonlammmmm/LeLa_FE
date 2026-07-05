import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd'; // Keeping message for toast notifications
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
};

export function QuizQuestionsAdminPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionResponse | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      questionType: 'MULTIPLE_CHOICE',
      points: 1,
      displayOrder: 0,
      isActive: true,
    }
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
      message.success(editingQuestion ? 'Question updated' : 'Question created');
      setIsModalOpen(false);
      reset();
      setEditingQuestion(null);
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions', quizId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizQuestionsApi.delete(id),
    onSuccess: () => {
      message.success('Question deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions', quizId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
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
        isActive: question.isActive
      });
    } else {
      setEditingQuestion(null);
      reset({
        questionText: '', questionImageUrl: '', explanation: '',
        questionType: 'MULTIPLE_CHOICE', points: 1, displayOrder: 0, isActive: true
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
          Back to Quizzes
        </Button>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000">
            Questions <span className="text-geist-gray-600 font-normal text-lg">/ Quiz #{quizId}</span>
          </h1>
          <p className="text-sm text-geist-gray-700 mt-1">Manage questions for this quiz</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Question
        </Button>
      </div>

      <div className="border border-geist-gray-400 rounded-lg bg-geist-bg-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-geist-gray-100 text-geist-gray-700 font-medium border-b border-geist-gray-300">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-geist-gray-300">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-geist-gray-600">Loading...</td></tr>
              ) : data?.data?.content?.map((question) => (
                <tr key={question.id} className="hover:bg-geist-gray-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{question.displayOrder}</td>
                  <td className="px-4 py-3 text-geist-gray-1000 font-medium whitespace-pre-wrap max-w-sm">{question.questionText}</td>
                  <td className="px-4 py-3 text-geist-gray-1000">{question.questionType}</td>
                  <td className="px-4 py-3 text-geist-gray-1000">{question.points}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(question)} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-geist-red-800 hover:text-geist-red-900 hover:bg-geist-red-100"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm('Delete this question? This action cannot be undone.')) {
                            deleteMutation.mutate(question.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.data?.content || data.data.content.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-geist-gray-600">No questions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editingQuestion ? 'Edit Question' : 'New Question'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Question Content</label>
            <textarea 
              {...register('questionText', { required: true })} 
              className="flex w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              rows={3}
            />
            {errors.questionText && <span className="text-xs text-geist-red-800">Required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Question Type</label>
              <select 
                {...register('questionType', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Points</label>
              <Input type="number" {...register('points')} min="1" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Display Order</label>
              <Input type="number" {...register('displayOrder')} min="0" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Image URL (Optional)</label>
              <Input {...register('questionImageUrl')} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Explanation</label>
            <textarea 
              {...register('explanation')} 
              className="flex w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              rows={2}
            />
          </div>
          
          <div className="space-y-2 flex flex-col justify-center mt-2">
            <label className="text-sm font-medium text-geist-gray-1000 mb-2">Active</label>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-geist-gray-400 text-geist-blue-700 focus:ring-geist-blue-700 bg-transparent"
                {...register('isActive')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
