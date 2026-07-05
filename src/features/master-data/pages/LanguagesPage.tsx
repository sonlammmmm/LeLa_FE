import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Switch, message } from 'antd';
import { languagesApi } from '../api/languages.api';
import type { LanguageResponse } from '../../../shared/types/lela';

export function LanguagesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLang, setEditingLang] = useState<LanguageResponse | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languagesApi.getAll(),
  });

  const saveMutation = useMutation({
    mutationFn: (values: any) => 
      editingLang ? languagesApi.update(editingLang.id, values) : languagesApi.create(values),
    onSuccess: () => {
      message.success('Lưu ngôn ngữ thành công');
      setIsModalOpen(false);
      form.resetFields();
      setEditingLang(null);
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Có lỗi xảy ra'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => languagesApi.delete(id),
    onSuccess: () => {
      message.success('Xóa ngôn ngữ thành công');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: (err: any) => message.error(err.response?.data?.message || 'Lỗi khi xóa'),
  });

  const openModal = (lang?: LanguageResponse) => {
    if (lang) {
      setEditingLang(lang);
      form.setFieldsValue(lang);
    } else {
      setEditingLang(null);
      form.resetFields();
      form.setFieldsValue({ isActive: true });
    }
    setIsModalOpen(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Mã (Code)', dataIndex: 'languageCode', key: 'languageCode', width: 120 },
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Tên gốc', dataIndex: 'nativeName', key: 'nativeName' },
    { 
      title: 'Hoạt động', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (isActive: boolean) => (
        <span className={`px-2 py-1 text-xs font-bold uppercase brutal-border ${isActive ? 'bg-[#2A8B9D] text-white' : 'bg-gray-200 text-black'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: LanguageResponse) => (
        <div className="flex gap-2">
          <Button onClick={() => openModal(record)} className="brutal-border font-bold">Sửa</Button>
          <Button 
            danger 
            className="brutal-border font-bold"
            onClick={() => {
              Modal.confirm({
                title: 'Xóa Ngôn ngữ này?',
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
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-[#1D2A3A]">Quản lý Ngôn Ngữ</h1>
        <Button 
          type="primary" 
          onClick={() => openModal()} 
          className="brutal-border brutal-shadow brutal-pill !bg-[#F05A4A] !text-white h-12 px-6 font-bold uppercase hover:!translate-y-[-2px] transition-transform"
        >
          Thêm ngôn ngữ
        </Button>
      </div>

      <div className="brutal-card bg-white p-4">
        <Table 
          dataSource={data?.data || []} 
          columns={columns} 
          rowKey="id" 
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={<span className="font-bold text-xl uppercase tracking-tight">{editingLang ? 'Sửa ngôn ngữ' : 'Thêm ngôn ngữ'}</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={(values) => saveMutation.mutate(values)} className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="languageCode" label={<span className="font-bold">Mã (VD: en, vi)</span>} rules={[{ required: true, message: 'Bắt buộc' }]}>
              <Input className="brutal-border h-12" />
            </Form.Item>
            <Form.Item name="name" label={<span className="font-bold">Tên tiếng Anh</span>} rules={[{ required: true, message: 'Bắt buộc' }]}>
              <Input className="brutal-border h-12" />
            </Form.Item>
          </div>
          
          <Form.Item name="nativeName" label={<span className="font-bold">Tên bản địa</span>} rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input className="brutal-border h-12" />
          </Form.Item>
          <Form.Item name="flagUrl" label={<span className="font-bold">URL Cờ</span>} rules={[{ required: true, message: 'Bắt buộc' }]}>
            <Input className="brutal-border h-12" placeholder="https://..." />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked" label={<span className="font-bold">Kích hoạt</span>}>
            <Switch className="border-black border-2" />
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
