import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, message } from 'antd';
import { quizzesApi } from '../api/quizzes.api';
import type { QuizResponse } from '../../../shared/types/lela';
import { useNavigate } from 'react-router-dom';

export function QuizzesAdminPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<QuizResponse | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-quizzes'],
    queryFn: () => quizzesApi.getAll({ size: 50 }),
  });

  const saveMutation = useMutation({
    mutationFn: (values: any) => 
      editingQuiz 
        ? quizzesApi.update(editingQuiz.id, { ...values, createdById: 1 }) 
        : quizzesApi.create({ ...values, createdById: 1 }), // Assuming admin ID is 1 for now
    onSuccess: () => {
      message.success('Lưu Quiz thành công');
      setIsModalOpen(false);
      form.resetFields();
      setEditingQuiz(null);
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizzesApi.delete(id),
    onSuccess: () => {
      message.success('Xóa Quiz thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-quizzes'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Lỗi khi xóa'),
  });

  const openModal = (quiz?: QuizResponse) => {
    if (quiz) {
      setEditingQuiz(quiz);
      form.setFieldsValue(quiz);
    } else {
      setEditingQuiz(null);
      form.resetFields();
      form.setFieldsValue({
        quizType: 'MULTIPLE_CHOICE',
        maxAttempts: 3,
        shuffleQuestions: true,
        shuffleOptions: true,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Mã', dataIndex: 'quizCode', width: 100 },
    { title: 'Tiêu đề', dataIndex: 'title' },
    { title: 'Loại', dataIndex: 'quizType', width: 150 },
    { title: 'Deck ID', dataIndex: 'deckId', width: 100 },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (val: boolean) => val ? 'Hoạt động' : 'Đã tắt' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: QuizResponse) => (
        <div className="flex gap-2">
          <Button onClick={() => openModal(record)} className="brutal-border font-bold">Sửa</Button>
          <Button 
            className="brutal-border font-bold !bg-[#2A8B9D] !text-white"
            onClick={() => navigate(`/admin/quizzes/${record.id}/questions`)}
          >
            Câu hỏi
          </Button>
          <Button 
            danger 
            className="brutal-border font-bold"
            onClick={() => {
              Modal.confirm({
                title: 'Xóa Quiz này?',
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
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-[#1D2A3A]">Quản lý Quizzes</h1>
        <Button 
          type="primary" 
          onClick={() => openModal()} 
          className="brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white h-12 px-6 font-bold uppercase"
        >
          Tạo Quiz Mới
        </Button>
      </div>

      <div className="brutal-card bg-white p-4">
        <Table 
          dataSource={data?.data?.content || []} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading}
        />
      </div>

      <Modal
        title={<span className="font-bold text-xl uppercase tracking-tight">{editingQuiz ? 'Sửa Quiz' : 'Tạo Quiz Mới'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="quizCode" label={<span className="font-bold">Mã Quiz</span>} rules={[{ required: true }]}>
              <Input className="brutal-border h-10" />
            </Form.Item>
            <Form.Item name="deckId" label={<span className="font-bold">Deck ID (Liên kết)</span>} rules={[{ required: true }]}>
              <InputNumber className="brutal-border w-full h-10" />
            </Form.Item>
          </div>
          
          <Form.Item name="title" label={<span className="font-bold">Tiêu đề</span>} rules={[{ required: true }]}>
            <Input className="brutal-border h-10" />
          </Form.Item>

          <Form.Item name="description" label={<span className="font-bold">Mô tả</span>}>
            <Input.TextArea className="brutal-border" rows={2} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="quizType" label={<span className="font-bold">Loại bài tập</span>}>
              <Select className="brutal-border h-10">
                <Select.Option value="MULTIPLE_CHOICE">Trắc nghiệm</Select.Option>
                <Select.Option value="TRUE_FALSE">Đúng / Sai</Select.Option>
                <Select.Option value="FILL_BLANK">Điền từ</Select.Option>
                <Select.Option value="MIXED">Hỗn hợp</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="timeLimitSeconds" label={<span className="font-bold">Thời gian (giây)</span>}>
              <InputNumber className="brutal-border w-full h-10" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Form.Item name="maxAttempts" label={<span className="font-bold">Số lần làm</span>}>
              <InputNumber className="brutal-border w-full h-10" min={1} />
            </Form.Item>
            <Form.Item name="shuffleQuestions" label={<span className="font-bold">Đảo câu hỏi</span>} valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isActive" label={<span className="font-bold">Hoạt động</span>} valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          
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
