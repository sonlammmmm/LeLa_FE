import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { tagsApi } from '../api/tags.api';
import type { TagResponse } from '../../../shared/types/lela';

export function TagsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagResponse | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagsApi.getAll(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: { name: string }) => 
      editingTag ? tagsApi.update(editingTag.id, values) : tagsApi.create(values),
    onSuccess: () => {
      message.success('Lưu thành công');
      setIsModalOpen(false);
      form.resetFields();
      setEditingTag(null);
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tagsApi.delete(id),
    onSuccess: () => {
      message.success('Xóa thành công');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Lỗi khi xóa'),
  });

  const openModal = (tag?: TagResponse) => {
    if (tag) {
      setEditingTag(tag);
      form.setFieldsValue({ name: tag.name });
    } else {
      setEditingTag(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên Tag', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: TagResponse) => (
        <div className="flex gap-2">
          <Button onClick={() => openModal(record)} className="brutal-border">Sửa</Button>
          <Button 
            danger 
            className="brutal-border"
            onClick={() => {
              Modal.confirm({
                title: 'Xóa Tag này?',
                content: 'Hành động này không thể hoàn tác.',
                onOk: () => deleteMutation.mutate(record.id),
              });
            }}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tighter">Quản lý Tags</h1>
        <Button 
          type="primary" 
          onClick={() => openModal()} 
          className="brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white h-12 px-6 font-bold"
        >
          THÊM TAG
        </Button>
      </div>

      <div className="brutal-card bg-white p-4">
        <Table 
          dataSource={data?.data?.content || []} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={<span className="font-bold text-xl">{editingTag ? 'Sửa Tag' : 'Thêm Tag mới'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="!rounded-none"
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)}>
          <Form.Item 
            name="name" 
            label={<span className="font-bold">Tên Tag</span>} 
            rules={[{ required: true, message: 'Nhập tên tag' }]}
          >
            <Input className="brutal-border h-12" placeholder="Ví dụ: N5, JLPT, Giao tiếp..." />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)} className="brutal-border h-10 font-bold">HỦY</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saveMutation.isPending}
              className="brutal-border brutal-shadow !bg-[#1D2A3A] !text-white h-10 px-6 font-bold"
            >
              LƯU
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
