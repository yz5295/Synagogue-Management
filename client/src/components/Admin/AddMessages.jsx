import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  List,
  message,
  Space,
  Typography,
  Modal,
} from "antd";
import axios from "axios";
import API_URL from "../../config";

const { TextArea } = Input;

const AddMessages = () => {
  const [form] = Form.useForm();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/messageAdmin`);
      setMessages(response.data);
    } catch (error) {
      message.error("שגיאה בטעינת ההודעות");
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (values) => {
    try {
      const response = await axios.post(`${API_URL}/messageAdmin`, values);
      setMessages((prev) => [...prev, response.data]);
      message.success("הודעה נוספה בהצלחה");
    } catch (error) {
      console.log(error);

      message.error("שגיאה בהוספת ההודעה");
    }
  };

  const updateMessage = async (id, updatedContent) => {
    try {
      const response = await axios.put(`/messageAdmin/${id}`, {
        content: updatedContent,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id ? { ...msg, content: updatedContent } : msg
        )
      );
      message.success("הודעה עודכנה בהצלחה");
    } catch (error) {
      message.error("שגיאה בעדכון ההודעה");
    }
  };

  const removeMessage = async (id) => {
    try {
      await axios.delete(`/messageAdmin/${id}`);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      message.success("הודעה נמחקה בהצלחה");
    } catch (error) {
      message.error("שגיאה במחיקת ההודעה");
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    if (editingMessage) {
      await updateMessage(editingMessage.id, editingMessage.content);
    }
    setIsModalVisible(false);
    setEditingMessage(null);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMessage(null);
  };

  const handleContentChange = (e) => {
    setEditingMessage({ ...editingMessage, content: e.target.value });
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Typography.Title level={3} style={{ textAlign: "center" }}>
        מערכת הודעות
      </Typography.Title>
      <Form form={form} onFinish={addMessage} layout="vertical">
        <Form.Item
          name="content"
          rules={[{ required: true, message: "נא להזין תוכן" }]}
        >
          <TextArea rows={4} placeholder="תוכן ההודעה" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          שלח הודעה
        </Button>
      </Form>

      <List
        loading={loading}
        bordered
        dataSource={messages}
        locale={{ emptyText: "אין נתונים להצגה" }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button type="link" onClick={() => handleEdit(item)}>
                ערוך
              </Button>,
              <Button type="link" danger onClick={() => removeMessage(item.id)}>
                מחק
              </Button>,
            ]}
          >
            <List.Item.Meta title={item.subject} description={item.content} />
          </List.Item>
        )}
      />

      <Modal
        title="ערוך הודעה"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <TextArea
          rows={4}
          value={editingMessage?.content || ""}
          onChange={handleContentChange}
        />
      </Modal>
    </Space>
  );
};

export default AddMessages;
