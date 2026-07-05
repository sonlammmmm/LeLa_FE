import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { decksApi } from '../api/decks.api';
import { languagesApi } from '../../master-data/api/languages.api';
import type { DeckResponse } from '../../../shared/types/lela';

export function DecksAdminPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<DeckResponse | null>(null);
  const [form] = Form.useForm();

  const { data: decksData, isLoading } = useQuery({
    queryKey: ['decks-admin'],
    queryFn: () => decksApi.getAll(),
  });

  const { data: languagesData } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getAll(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: any) => 
      editingDeck ? decksApi.update(editingDeck.id, values) : decksApi.create(values),
    onSuccess: () => {
      message.success('Lưu thành công');
      setIsModalOpen(false);
      form.resetFields();
      setEditingDeck(null);
      queryClient.invalidateQueries({ queryKey: ['decks-admin'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => decksApi.delete(id),
    onSuccess: () => {
      message.success('Xóa thành công');
      queryClient.invalidateQueries({ queryKey: ['decks-admin'] });
    },
  });

  const openModal = (deck?: DeckResponse) => {
    if (deck) {
      setEditingDeck(deck);
      form.setFieldsValue(deck);
    } else {
      setEditingDeck(null);
      form.resetFields();
      form.setFieldsValue({ difficulty: 'BEGINNER', visibility: 'PUBLIC' });
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Tiêu đề', dataIndex: 'title' },
    { title: 'Category', dataIndex: 'category' },
    { title: 'Độ khó', dataIndex: 'difficulty' },
    { title: 'Trạng thái', dataIndex: 'status' },
    { title: 'Số thẻ', dataIndex: 'totalCards' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: DeckResponse) => (
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => openModal(record)} className="brutal-border font-bold">Sửa</Button>
          <Button 
            onClick={() => navigate(`/admin/decks/${record.id}/flashcards`)} 
            className="brutal-border font-bold !bg-[#2A8B9D] !text-white hover:!bg-[#227282]"
          >
            Quản lý Thẻ
          </Button>
          <Button 
            danger 
            className="brutal-border font-bold"
            onClick={() => {
              Modal.confirm({
                title: 'Xóa Deck này?',
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
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-[#1D2A3A]">Quản lý Bộ Thẻ (Decks)</h1>
        <Button 
          type="primary" 
          onClick={() => openModal()} 
          className="brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white h-12 px-6 font-bold uppercase"
        >
          Thêm Deck Mới
        </Button>
      </div>

      <div className="brutal-card bg-white p-4">
        <Table 
          dataSource={decksData?.content || []} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10, total: decksData?.totalElements || 0 }}
        />
      </div>

      <Modal
        title={<span className="font-bold text-xl uppercase tracking-tight">{editingDeck ? 'Sửa Deck' : 'Thêm Deck mới'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)} className="mt-4">
          <Form.Item name="title" label={<span className="font-bold">Tiêu đề</span>} rules={[{ required: true }]}>
            <Input className="brutal-border h-12" />
          </Form.Item>
          
          <Form.Item name="description" label={<span className="font-bold">Mô tả</span>}>
            <Input.TextArea className="brutal-border" rows={3} />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="languageId" label={<span className="font-bold">Ngôn ngữ</span>} rules={[{ required: true }]}>
              <Select className="h-12 border-black border-[3px]" options={languagesData?.data?.map(l => ({ label: l.name, value: l.id }))} />
            </Form.Item>
            <Form.Item name="category" label={<span className="font-bold">Chủ đề (Category)</span>} rules={[{ required: true }]}>
              <Input className="brutal-border h-12" placeholder="Ví dụ: JLPT N5" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="difficulty" label={<span className="font-bold">Độ khó</span>}>
              <Select className="h-12 border-black border-[3px]">
                <Select.Option value="BEGINNER">BEGINNER</Select.Option>
                <Select.Option value="INTERMEDIATE">INTERMEDIATE</Select.Option>
                <Select.Option value="ADVANCED">ADVANCED</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="visibility" label={<span className="font-bold">Hiển thị</span>}>
              <Select className="h-12 border-black border-[3px]">
                <Select.Option value="PUBLIC">PUBLIC</Select.Option>
                <Select.Option value="PRIVATE">PRIVATE</Select.Option>
                <Select.Option value="UNLISTED">UNLISTED</Select.Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item name="coverImageUrl" label={<span className="font-bold">URL Ảnh bìa</span>}>
            <Input className="brutal-border h-12" placeholder="https://..." />
          </Form.Item>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)} className="brutal-border h-12 font-bold px-6">HỦY</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saveMutation.isPending}
              className="brutal-border brutal-shadow !bg-[#1D2A3A] !text-white h-12 px-8 font-bold"
            >
              LƯU
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
