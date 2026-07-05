import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { flashcardsApi } from '../api/flashcards.api';
import type { FlashcardResponse } from '../../../shared/types/lela';

export function FlashcardsAdminPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<FlashcardResponse | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['flashcards', deckId],
    queryFn: () => flashcardsApi.getByDeckId(Number(deckId)),
    enabled: !!deckId,
  });

  const saveMutation = useMutation({
    mutationFn: (values: any) => 
      editingCard 
        ? flashcardsApi.update(editingCard.id, { ...values, deckId: Number(deckId) }) 
        : flashcardsApi.create({ ...values, deckId: Number(deckId) }),
    onSuccess: () => {
      message.success('Lưu thẻ thành công');
      setIsModalOpen(false);
      form.resetFields();
      setEditingCard(null);
      queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => flashcardsApi.delete(id),
    onSuccess: () => {
      message.success('Xóa thẻ thành công');
      queryClient.invalidateQueries({ queryKey: ['flashcards', deckId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Lỗi khi xóa'),
  });

  const openModal = (card?: FlashcardResponse) => {
    if (card) {
      setEditingCard(card);
      form.setFieldsValue(card);
    } else {
      setEditingCard(null);
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Mặt trước (Front)', dataIndex: 'frontText', width: 250 },
    { title: 'Mặt sau (Back)', dataIndex: 'backText', width: 250 },
    { title: 'Phiên âm', dataIndex: 'phonetic' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: FlashcardResponse) => (
        <div className="flex gap-2">
          <Button onClick={() => openModal(record)} className="brutal-border font-bold">Sửa</Button>
          <Button 
            danger 
            className="brutal-border font-bold"
            onClick={() => {
              Modal.confirm({
                title: 'Xóa Thẻ này?',
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
      <div className="mb-4">
        <Button onClick={() => navigate('/admin/decks')} className="brutal-border font-bold">
          &larr; QUAY LẠI DANH SÁCH DECK
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-[#1D2A3A]">
          Quản lý Flashcards (Deck #{deckId})
        </h1>
        <Button 
          type="primary" 
          onClick={() => openModal()} 
          className="brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white h-12 px-6 font-bold uppercase"
        >
          Thêm thẻ mới
        </Button>
      </div>

      <div className="brutal-card bg-white p-4">
        <Table 
          dataSource={data?.content || []} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 20, total: data?.totalElements || 0 }}
        />
      </div>

      <Modal
        title={<span className="font-bold text-xl uppercase tracking-tight">{editingCard ? 'Sửa thẻ' : 'Thêm thẻ mới'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="frontText" label={<span className="font-bold">Mặt trước (Từ vựng)</span>} rules={[{ required: true }]}>
              <Input.TextArea className="brutal-border" rows={2} />
            </Form.Item>
            <Form.Item name="backText" label={<span className="font-bold">Mặt sau (Nghĩa)</span>} rules={[{ required: true }]}>
              <Input.TextArea className="brutal-border" rows={2} />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="phonetic" label={<span className="font-bold">Phiên âm / Cách đọc</span>}>
              <Input className="brutal-border h-10" />
            </Form.Item>
            <Form.Item name="exampleText" label={<span className="font-bold">Câu ví dụ</span>}>
              <Input.TextArea className="brutal-border" rows={2} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="frontImageUrl" label={<span className="font-bold">URL Ảnh minh họa</span>}>
              <Input className="brutal-border h-10" placeholder="https://..." />
            </Form.Item>
            <Form.Item name="frontAudioUrl" label={<span className="font-bold">URL Âm thanh đọc</span>}>
              <Input className="brutal-border h-10" placeholder="https://..." />
            </Form.Item>
          </div>

          <Form.Item name="hint" label={<span className="font-bold">Gợi ý học (Hint)</span>}>
            <Input className="brutal-border h-10" />
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
