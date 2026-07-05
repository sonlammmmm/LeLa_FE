import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { message } from 'antd'; // Keeping message for toast notifications
import { tagsApi } from '../api/tags.api';
import type { TagResponse } from '../../../shared/types/lela';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Modal } from '../../../shared/components/ui/Modal';

type FormValues = {
  name: string;
};

export function TagsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const { data, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getAll(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) => 
      editingTag ? tagsApi.update(editingTag.id, values) : tagsApi.create(values),
    onSuccess: () => {
      message.success(editingTag ? 'Tag updated' : 'Tag created');
      setIsModalOpen(false);
      reset();
      setEditingTag(null);
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tagsApi.delete(id),
    onSuccess: () => {
      message.success('Tag deleted');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'An error occurred'),
  });

  const openModal = (tag?: TagResponse) => {
    if (tag) {
      setEditingTag(tag);
      reset({ name: tag.name });
    } else {
      setEditingTag(null);
      reset({ name: '' });
    }
    setIsModalOpen(true);
  };

  const onSubmit = (values: FormValues) => {
    saveMutation.mutate(values);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000">Tags</h1>
          <p className="text-sm text-geist-gray-700 mt-1">Manage content tags and categories</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Tag
        </Button>
      </div>

      <div className="border border-geist-gray-400 rounded-lg bg-geist-bg-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-geist-gray-100 text-geist-gray-700 font-medium border-b border-geist-gray-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-geist-gray-300">
              {isLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-geist-gray-600">Loading...</td></tr>
              ) : data?.data?.content?.map((tag) => (
                <tr key={tag.id} className="hover:bg-geist-gray-100/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-geist-gray-900">{tag.id}</td>
                  <td className="px-4 py-3 text-geist-gray-1000 font-medium">{tag.name}</td>
                  <td className="px-4 py-3 font-mono text-geist-gray-800">{tag.slug}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openModal(tag)} title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-geist-red-800 hover:text-geist-red-900 hover:bg-geist-red-100"
                        title="Delete"
                        onClick={() => {
                          if (window.confirm('Delete this tag? This action cannot be undone.')) {
                            deleteMutation.mutate(tag.id);
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
                <tr><td colSpan={4} className="px-4 py-8 text-center text-geist-gray-600">No tags found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        title={editingTag ? 'Edit Tag' : 'New Tag'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Tag Name</label>
            <Input 
              {...register('name', { required: true })} 
              placeholder="e.g. Grammar, N5, Conversation..." 
            />
            {errors.name && <span className="text-xs text-geist-red-800">Required</span>}
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
