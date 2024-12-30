import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Result } from "antd";
import { SendOutlined } from "@ant-design/icons";
import axios from "axios";
import SendEmail from "./SendEmail";

const { Title } = Typography;
const { TextArea } = Input;

const SendMessage = () => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [form] = Form.useForm();

  const token = JSON.parse(localStorage.getItem("token"));
  const fetchUser = async () => {
    try {
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserEmail(response.data.user.email);
      console.log(response.data.user);

      return response.data.user.id;
    } catch (error) {
      message.error("שגיאה בשליפת פרטי המשתמש.");
    }
  };

  const handleSubmit = async () => {
    const userId = await fetchUser();
    const messageData = {
      subject,
      text: message,
      timestamp: new Date().toISOString(),
      read: false,
      user_id: userId,
    };

    try {
      const response = await fetch("/messages/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (response.ok) {
        setModalMessage("ההודעה נשלחה בהצלחה!");
        setIsSuccess(true);
        setMessage("");
        setSubject("");
        form.resetFields();
      } else {
        setModalMessage("הייתה בעיה בשליחת ההודעה");
        setIsSuccess(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setModalMessage("אירעה שגיאה");
      setIsSuccess(false);
    }

    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setIsSuccess(false);
  };

  return (
    <Card
      style={{
        maxWidth: 600,
        margin: "auto",
        padding: 20,
        textAlign: "right",
        direction: "rtl",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    >
      {!isSuccess ? (
        <>
          <Title level={3} style={{ textAlign: "center" }}>
            שלח הודעה
          </Title>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="כותרת"
              name="subject"
              rules={[{ required: true, message: "אנא הזן כותרת" }]}
            >
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="הזן כותרת"
              />
            </Form.Item>
            <Form.Item
              label="תוכן ההודעה"
              name="message"
              rules={[{ required: true, message: "אנא הזן תוכן להודעה" }]}
            >
              <TextArea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="הזן תוכן ההודעה"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                style={{ width: "100%" }}
              >
                שלח הודעה
              </Button>
            </Form.Item>
          </Form>
        </>
      ) : (
        <Result
          status={isSuccess ? "success" : "error"}
          title={isSuccess ? "ההודעה נשלחה בהצלחה!" : "אירעה שגיאה"}
          subTitle={modalMessage}
          extra={
            <Button type="primary" onClick={handleModalClose}>
              חזור לטופס
              <SendEmail
                to={userEmail}
                subject="כותרת המייל"
                text="זהו תוכן המייל שנשלח אוטומטית"
              />
            </Button>
          }
        />
      )}
    </Card>
  );
};

export default SendMessage;
