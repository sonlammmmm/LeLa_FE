import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Select, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { quizQuestionsApi } from '../api/quiz-questions.api';
import type { QuizQuestionResponse } from '../../../shared/types/lela';

export function QuizQuestionsAdminPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestionResponse | null>(null);
  const [form] = Form.useForm();

  // The BE doesn't seem to have getByQuizId yet, so we filter getAll client-side or assume BE handles it via params
  const { data, isLoading } = useQuery({
    queryKey: ['admin-quiz-questions', quizId],
    queryFn: () => quizQuestionsApi.getAll({ quizId, size: 100 }), // Assumes backend can filter by quizId
  });

  const saveMutation = useMutation({
    mutationFn: (values: any) => 
      editingQuestion 
        ? quizQuestionsApi.update(editingQuestion.id, { ...values, quizId: Number(quizId) }) 
        : quizQuestionsApi.create({ ...values, quizId: Number(quizId) }),
    onSuccess: () => {
      message.success('Lưu câu hỏi thành công');
      setIsModalOpen(false);
      form.resetFields();
      setEditingQuestion(null);
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions', quizId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => quizQuestionsApi.delete(id),
    onSuccess: () => {
      message.success('Xóa câu hỏi thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions', quizId] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Lỗi khi xóa'),
  });

  const openModal = (question?: QuizQuestionResponse) => {
    if (question) {
      setEditingQuestion(question);
      form.setFieldsValue(question);
    } else {
      setEditingQuestion(null);
      form.resetFields();
      form.setFieldsValue({
        questionType: 'MULTIPLE_CHOICE',
        points: 1,
        displayOrder: 0,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'Thứ tự', dataIndex: 'displayOrder', width: 80 },
    { title: 'Câu hỏi', dataIndex: 'questionText' },
    { title: 'Loại', dataIndex: 'questionType', width: 150 },
    { title: 'Điểm', dataIndex: 'points', width: 80 },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: QuizQuestionResponse) => (
        <div className="flex gap-2">
          <Button onClick={() => openModal(record)} className="brutal-border font-bold">Sửa</Button>
          <Button 
            danger 
            className="brutal-border font-bold"
            onClick={() => {
              Modal.confirm({
                title: 'Xóa câu hỏi này?',
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
        <Button onClick={() => navigate('/admin/quizzes')} className="brutal-border font-bold">
          &larr; QUAY LẠI QUẢN LÝ QUIZZES
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-[#1D2A3A]">
          Câu hỏi (Quiz #{quizId})
        </h1>
        <Button 
          type="primary" 
          onClick={() => openModal()} 
          className="brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white h-12 px-6 font-bold uppercase"
        >
          Thêm Câu Hỏi
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
        title={<span className="font-bold text-xl uppercase tracking-tight">{editingQuestion ? 'Sửa Câu Hỏi' : 'Thêm Câu Hỏi'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)} className="mt-4">
          <Form.Item name="questionText" label={<span className="font-bold">Nội dung câu hỏi</span>} rules={[{ required: true }]}>
            <Input.TextArea className="brutal-border" rows={3} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="questionType" label={<span className="font-bold">Loại câu hỏi</span>}>
              <Select className="brutal-border h-10">
                <Select.Option value="MULTIPLE_CHOICE">Trắc nghiệm</Select.Option>
                <Select.Option value="TRUE_FALSE">Đúng / Sai</Select.Option>
                <Select.Option value="FILL_IN_THE_BLANK">Điền từ</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="points" label={<span className="font-bold">Điểm số</span>}>
              <InputNumber className="brutal-border w-full h-10" min={1} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="displayOrder" label={<span className="font-bold">Thứ tự hiển thị</span>}>
              <InputNumber className="brutal-border w-full h-10" min={0} />
            </Form.Item>
            <Form.Item name="questionImageUrl" label={<span className="font-bold">URL Ảnh minh họa</span>}>
              <Input className="brutal-border h-10" />
            </Form.Item>
          </div>

          <Form.Item name="explanation" label={<span className="font-bold">Giải thích đáp án</span>}>
            <Input.TextArea className="brutal-border" rows={2} />
          </Form.Item>
          
          <Form.Item name="isActive" label={<span className="font-bold">Hoạt động</span>} valuePropName="checked">
            <Switch />
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
