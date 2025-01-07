import React, { useState } from "react";
import { Form, Input, Button, Typography, Card, Result } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import API_URL from "../../config";

const { Title } = Typography;
const { TextArea } = Input;

const SendMessage = () => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { user } = useUser();

  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const messageData = {
      subject,
      text: message,
      timestamp: new Date().toISOString(),
      read: false,
      user_id: user.id,
    };

    try {
      const response = await axios.post(
        `${API_URL}/messages/sendMessage`,
        messageData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
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
    // setModalVisible(false);
    // setIsSuccess(false);
    navigate("/member");
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
                icon={<ArrowLeftOutlined />}
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  marginRight: "5px",
                }}
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
              חזור
            </Button>
          }
        />
      )}
    </Card>
  );
};

export default SendMessage;
