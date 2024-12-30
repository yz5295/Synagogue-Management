import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, message } from "antd";
import axios from "axios";

const MemberList = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/api/users/all");
      setUsers(data);
    } catch (error) {
      message.error("שגיאה בטעינת נתוני מתפללים");
    }
  };

  const handleAddUser = async (values) => {
    try {
      const { data } = await axios.post("/api/users", values);
      setUsers((prev) => [...prev, data]);
      message.success("מתפלל נוסף בהצלחה");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error("שגיאה בהוספת המתפלל");
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      console.log(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      message.success("מתפלל הוסר בהצלחה");
    } catch (error) {
      message.error("שגיאה במחיקת המתפלל");
    }
  };

  const columns = [
    { title: "שם פרטי", dataIndex: "first_name", key: "first_name" },
    { title: "שם משפחה", dataIndex: "last_name", key: "last_name" },
    { title: "כתובת", dataIndex: "address", key: "address" },
    { title: "עיר", dataIndex: "city", key: "city" },
    { title: "מספר טלפון", dataIndex: "phone", key: "phone" },
    { title: "כתובת מייל", dataIndex: "email", key: "email" },
    {
      title: "פעולות",
      key: "actions",
      render: (text, record) => (
        <Button
          danger
          onClick={() => {
            handleDeleteUser(record.id);
            console.log(record.id);
          }}
        >
          מחק
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      {/* <Button type="primary" onClick={() => setIsModalOpen(true)}>
        הוסף מתפלל
      </Button> */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey={(record, index) => index}
        style={{ marginTop: "20px" }}
        locale={{ emptyText: "אין נתונים להצגה" }}
      />
      {/* <Modal
        title="הוסף מתפלל חדש"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        okText="שמור"
        cancelText="ביטול"
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item
            name="first_name"
            label="שם פרטי"
            rules={[{ required: true, message: "נא למלא שם פרטי" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="שם משפחה"
            rules={[{ required: true, message: "נא למלא שם משפחה" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="כתובת"
            rules={[{ required: true, message: "נא למלא כתובת" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="עיר"
            rules={[{ required: true, message: "נא למלא עיר" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="נייד"
            rules={[
              { required: true, message: "נא למלא מספר נייד" },
              {
                pattern: /^[0-9]{9,}$/,
                message: "נא להזין מספר נייד תקין",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="כתובת מייל"
            rules={[
              { required: true, message: "נא למלא כתובת מייל" },
              {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                type: "email",
                message: "נא להזין כתובת מייל תקינה",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="סיסמה"
            rules={[
              { required: true, message: "נא למלא סיסמה" },
              {
                min: 6,
                message: "סיסמה חייבת להיות לפחות 6 תווים",
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal> */}
    </div>
  );
};

export default MemberList;
