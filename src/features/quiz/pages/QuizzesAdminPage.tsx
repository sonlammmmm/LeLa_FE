import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Settings2 } from 'lucide-react';
import { quizzesApi } from '../api/quizzes.api';
import type { QuizResponse } from '../../../shared/types/lela';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd'; // Keeping message for toast notifications
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
  maxAttempts: number;
  shuffleQuestions: boolean;
  isActive: boolean;
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

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => 
      editingQuiz 
        ? quizzesApi.update(editingQuiz.id, { ...values, createdById: 1 }) 
        : quizzesApi.create({ ...values, createdById: 1 }), // Assuming admin ID is 1 for now
    onSuccess: () => {
      message.success(editingQuiz ? 'Quiz updated' : 'Quiz created');
      setIsModalOpen(false);
      reset();
      setEditingQuiz(null);
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizzesApi.delete(id),
    onSuccess: () => {
      message.success('Quiz deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
  });

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
        maxAttempts: quiz.maxAttempts,
        shuffleQuestions: quiz.shuffleQuestions,
        isActive: quiz.isActive
      });
    } else {
      setEditingQuiz(null);
      reset({
        quizCode: '', deckId: undefined, title: '', description: '',
        quizType: 'MULTIPLE_CHOICE', maxAttempts: 3, shuffleQuestions: true, isActive: true, timeLimitSeconds: null
      });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    values.deckId = Number(values.deckId);
    values.maxAttempts = Number(values.maxAttempts);
    if (values.timeLimitSeconds) values.timeLimitSeconds = Number(values.timeLimitSeconds);
    saveMutation.mutate(values);
  };

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000">Quizzes</h1>
          <p className="text-sm text-geist-gray-700 mt-1">Manage quizzes and assignments</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Quiz
        </Button>
      </div>

      <div className="border border-geist-gray-400 rounded-lg bg-geist-bg-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-geist-gray-100 text-geist-gray-700 font-medium border-b border-geist-gray-300">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Deck ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-geist-gray-300">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-geist-gray-600">Loading...</td></tr>
              ) : data?.data?.content?.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-geist-gray-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{quiz.quizCode}</td>
                  <td className="px-4 py-3 text-geist-gray-1000 font-medium">{quiz.title}</td>
                  <td className="px-4 py-3 text-geist-gray-1000">{quiz.quizType}</td>
                  <td className="px-4 py-3 font-mono text-geist-gray-700">{quiz.deckId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      quiz.isActive ? 'bg-geist-success-100 text-geist-success-800' : 'bg-geist-gray-200 text-geist-gray-800'
                    }`}>
                      {quiz.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/quizzes/${quiz.id}/questions`)}>
                        <Settings2 className="w-3.5 h-3.5 mr-1" />
                        Questions
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openModal(quiz)} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-geist-red-800 hover:text-geist-red-900 hover:bg-geist-red-100"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm('Delete this quiz? This action cannot be undone.')) {
                            deleteMutation.mutate(quiz.id);
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
                <tr><td colSpan={6} className="px-4 py-8 text-center text-geist-gray-600">No quizzes found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editingQuiz ? 'Edit Quiz' : 'New Quiz'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Quiz Code</label>
              <Input {...register('quizCode', { required: true })} />
              {errors.quizCode && <span className="text-xs text-geist-red-800">Required</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Deck ID</label>
              <Input type="number" {...register('deckId', { required: true })} />
              {errors.deckId && <span className="text-xs text-geist-red-800">Required</span>}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Title</label>
            <Input {...register('title', { required: true })} />
            {errors.title && <span className="text-xs text-geist-red-800">Required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Description</label>
            <textarea 
              {...register('description')} 
              className="flex w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Quiz Type</label>
              <select 
                {...register('quizType', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="FILL_BLANK">Fill in the Blank</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Time Limit (seconds)</label>
              <Input type="number" {...register('timeLimitSeconds')} placeholder="Optional" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Max Attempts</label>
              <Input type="number" {...register('maxAttempts')} min="1" />
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <label className="text-sm font-medium text-geist-gray-1000 mb-2">Shuffle Questions</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-geist-gray-400 text-geist-blue-700 focus:ring-geist-blue-700 bg-transparent"
                  {...register('shuffleQuestions')}
                />
              </div>
            </div>
            <div className="space-y-2 flex flex-col justify-center">
              <label className="text-sm font-medium text-geist-gray-1000 mb-2">Active</label>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-geist-gray-400 text-geist-blue-700 focus:ring-geist-blue-700 bg-transparent"
                  {...register('isActive')}
                />
              </div>
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
