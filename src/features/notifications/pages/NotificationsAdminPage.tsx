import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Bell, Send } from 'lucide-react';
import { message } from 'antd';
import { notificationsApi } from '../api/notifications.api';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';

type FormValues = {
  title: string;
  message: string;
  type: string;
};

export function NotificationsAdminPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { type: 'SYSTEM' }
  });

  const broadcastMutation = useMutation({
    mutationFn: (values: FormValues) => notificationsApi.broadcast(values),
    onSuccess: () => {
      message.success('Gửi thông báo thành công');
      reset();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi thông báo');
    },
  });

  const onSubmit = (values: FormValues) => {
    broadcastMutation.mutate(values);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-geist-gray-1000 flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Gửi thông báo toàn hệ thống
        </h1>
        <p className="text-sm text-geist-gray-700 mt-1">
          Gửi thông báo đẩy đến tất cả người dùng trong hệ thống (System Alert).
        </p>
      </div>

      <div className="border border-geist-gray-400 rounded-lg bg-geist-bg-100 p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Tiêu đề thông báo</label>
            <Input 
              {...register('title', { required: 'Vui lòng nhập tiêu đề' })} 
              placeholder="VD: Bảo trì hệ thống đêm nay"
              className="w-full"
            />
            {errors.title && <span className="text-xs text-geist-red-800">{errors.title.message}</span>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Nội dung</label>
            <textarea 
              {...register('message', { required: 'Vui lòng nhập nội dung' })} 
              placeholder="Nhập nội dung chi tiết của thông báo..."
              className="flex w-full min-h-[120px] resize-none rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 placeholder:text-geist-gray-600 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
              rows={5}
            />
            {errors.message && <span className="text-xs text-geist-red-800">{errors.message.message}</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-geist-gray-1000">Loại thông báo</label>
            <select 
              {...register('type')}
              className="flex h-10 w-full rounded-md border border-geist-gray-400 bg-transparent px-3 py-2 text-sm text-geist-gray-1000 focus:outline-none focus:ring-2 focus:ring-geist-blue-700 hover:border-geist-gray-600 transition-colors"
            >
              <option value="SYSTEM">Cảnh báo hệ thống</option>
              <option value="NEW_CONTENT">Cập nhật tính năng / Nội dung mới</option>
              <option value="ACHIEVEMENT">Sự kiện / Khuyến mãi</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={broadcastMutation.isPending} className="w-full sm:w-auto">
              <Send className="w-4 h-4 mr-2" />
              {broadcastMutation.isPending ? 'Đang gửi...' : 'Phát sóng ngay'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
