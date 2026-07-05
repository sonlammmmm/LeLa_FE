import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd'; // Keeping message for toast notifications
import { flashcardsApi } from '../api/flashcards.api';
import type { FlashcardResponse } from '../../../shared/types/lela';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Modal } from '../../../shared/components/ui/Modal';

type FormValues = {
  frontText: string;
  backText: string;
  phonetic: string;
  exampleText: string;
  frontImageUrl: string;
  frontAudioUrl: string;
  hint: string;
};

export function FlashcardsAdminPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardResponse | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const { data, isLoading } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => flashcardsApi.getByDeckId(Number(deckId)),
    enabled: !!deckId,
  });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => 
      editingCard 
        ? flashcardsApi.update(editingCard.id, { ...values, deckId: Number(deckId) }) 
        : flashcardsApi.create({ ...values, deckId: Number(deckId) }),
    onSuccess: () => {
      message.success(editingCard ? 'Card updated' : 'Card created');
      setIsModalOpen(false);
      reset();
      setEditingCard(null);
      queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => flashcardsApi.delete(id),
    onSuccess: () => {
      message.success('Card deleted');
      queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
  });

  const openModal = (card?: FlashcardResponse) => {
    if (card) {
      setEditingCard(card);
      reset({
        frontText: card.frontText,
        backText: card.backText,
        phonetic: card.phonetic || '',
        exampleText: card.exampleText || '',
        frontImageUrl: card.frontImageUrl || '',
        frontAudioUrl: card.frontAudioUrl || '',
        hint: card.hint || ''
      });
    } else {
      setEditingCard(null);
      reset({ frontText: '', backText: '', phonetic: '', exampleText: '', frontImageUrl: '', frontAudioUrl: '', hint: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values);
  };

  return (
    <div className="max-w-7xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin/decks')} className="text-geist-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Decks
        </Button>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000">
            Flashcards <span className="text-geist-gray-600 font-normal text-lg">/ Deck #{deckId}</span>
          </h1>
          <p className="text-sm text-geist-gray-700 mt-1">Manage individual flashcards within this deck</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Card
        </Button>
      </div>

      <div className="border border-geist-gray-400 rounded-lg bg-geist-bg-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-geist-gray-100 text-geist-gray-700 font-medium border-b border-geist-gray-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Front</th>
                <th className="px-4 py-3">Back</th>
                <th className="px-4 py-3">Phonetic</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-geist-gray-300">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-geist-gray-600">Loading...</td></tr>
              ) : data?.content?.map((card) => (
                <tr key={card.id} className="hover:bg-geist-gray-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{card.id}</td>
                  <td className="px-4 py-3 text-geist-gray-1000 font-medium whitespace-pre-wrap max-w-xs">{card.frontText}</td>
                  <td className="px-4 py-3 text-geist-gray-1000 whitespace-pre-wrap max-w-xs">{card.backText}</td>
                  <td className="px-4 py-3 text-geist-gray-700">{card.phonetic}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(card)} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-geist-red-800 hover:text-geist-red-900 hover:bg-geist-red-100"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm('Delete this card? This action cannot be undone.')) {
                            deleteMutation.mutate(card.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.content || data.content.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-geist-gray-600">No cards found in this deck</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editingCard ? 'Edit Card' : 'New Card'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Front (Vocabulary)</label>
              <textarea 
                {...register('frontText', { required: true })} 
                className="flex w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
                rows={3}
              />
              {errors.frontText && <span className="text-xs text-geist-red-800">Required</span>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Back (Meaning)</label>
              <textarea 
                {...register('backText', { required: true })} 
                className="flex w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
                rows={3}
              />
              {errors.backText && <span className="text-xs text-geist-red-800">Required</span>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Phonetic / Pronunciation</label>
              <Input {...register('phonetic')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Example Sentence</label>
              <textarea 
                {...register('exampleText')} 
                className="flex w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
                rows={2}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Image URL (Optional)</label>
              <Input {...register('frontImageUrl')} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-geist-gray-1000">Audio URL (Optional)</label>
              <Input {...register('frontAudioUrl')} placeholder="https://..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Learning Hint</label>
            <Input {...register('hint')} />
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
