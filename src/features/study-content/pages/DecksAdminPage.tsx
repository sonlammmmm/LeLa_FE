import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd'; // Keeping message for toast notifications
import { decksApi } from '../api/decks.api';
import { languagesApi } from '../../master-data/api/languages.api';
import type { DeckResponse } from '../../../shared/types/lela';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Modal } from '../../../shared/components/ui/Modal';

type FormValues = {
  title: string;
  description: string;
  languageId: number;
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
  coverImageUrl: string;
};

export function DecksAdminPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckResponse | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { difficulty: 'BEGINNER', visibility: 'PUBLIC' }
  });

  const { data: decksData, isLoading } = useQuery({
    queryKey: ['decks-admin'],
    queryFn: () => decksApi.getAll(),
  });

  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getAll(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => 
      editingDeck ? decksApi.update(editingDeck.id, values) : decksApi.create(values),
    onSuccess: () => {
      message.success(editingDeck ? 'Deck updated' : 'Deck created');
      setIsModalOpen(false);
      reset();
      setEditingDeck(null);
      queryClient.invalidateQueries({ queryKey: ['decks-admin'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => decksApi.delete(id),
    onSuccess: () => {
      message.success('Deck deleted');
      queryClient.invalidateQueries({ queryKey: ['decks-admin'] });
    },
  });

  const openModal = (deck?: DeckResponse) => {
    if (deck) {
      setEditingDeck(deck);
      reset({
        title: deck.title,
        description: deck.description || '',
        languageId: deck.languageId,
        category: deck.category || '',
        difficulty: deck.difficulty as any,
        visibility: deck.visibility as any,
        coverImageUrl: deck.coverImageUrl || ''
      });
    } else {
      setEditingDeck(null);
      reset({ difficulty: 'BEGINNER', visibility: 'PUBLIC', languageId: undefined });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    // ensure languageId is number
    values.languageId = Number(values.languageId);
    saveMutation.mutate(values);
  };

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000">Decks</h1>
          <p className="text-sm text-geist-gray-700 mt-1">Manage study decks and collections</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Deck
        </Button>
      </div>

      <div className="border border-geist-gray-400 rounded-lg bg-geist-bg-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-geist-gray-100 text-geist-gray-700 font-medium border-b border-geist-gray-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Cards</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-geist-gray-300">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-geist-gray-600">Loading...</td></tr>
              ) : decksData?.content?.map((deck) => (
                <tr key={deck.id} className="hover:bg-geist-gray-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{deck.id}</td>
                  <td className="px-4 py-3 text-geist-gray-1000 font-medium">{deck.title}</td>
                  <td className="px-4 py-3 text-geist-gray-1000">{deck.category}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-geist-gray-200 text-geist-gray-800">
                      {deck.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      deck.status === 'PUBLISHED' ? 'bg-geist-success-100 text-geist-success-800' : 'bg-geist-gray-200 text-geist-gray-800'
                    }`}>
                      {deck.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium">{deck.totalCards || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/admin/decks/${deck.id}/flashcards`)}>
                        <Settings2 className="w-3.5 h-3.5 mr-1" />
                        Cards
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openModal(deck)} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-geist-red-800 hover:text-geist-red-900 hover:bg-geist-red-100"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm('Delete this deck? This action cannot be undone.')) {
                            deleteMutation.mutate(deck.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!decksData?.content || decksData.content.length === 0) && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-geist-gray-600">No decks found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editingDeck ? 'Edit Deck' : 'New Deck'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Title</label>
            <Input {...register('title', { required: true })} />
            {errors.title && <span className="text-xs text-geist-red-800">Required</span>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Description</label>
            <textarea 
              {...register('description')} 
              className="flex w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 placeholder:text-geist-gray-600 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Language</label>
              <select 
                {...register('languageId', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="">Select language...</option>
                {languagesData?.data?.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              {errors.languageId && <span className="text-xs text-geist-red-800">Required</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Category</label>
              <Input {...register('category', { required: true })} placeholder="e.g. JLPT N5" />
              {errors.category && <span className="text-xs text-geist-red-800">Required</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Difficulty</label>
              <select 
                {...register('difficulty', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="BEGINNER">BEGINNER</option>
                <option value="INTERMEDIATE">INTERMEDIATE</option>
                <option value="ADVANCED">ADVANCED</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Visibility</label>
              <select 
                {...register('visibility', { required: true })}
                className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="PRIVATE">PRIVATE</option>
                <option value="UNLISTED">UNLISTED</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Cover Image URL</label>
            <Input {...register('coverImageUrl')} placeholder="https://..." />
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
