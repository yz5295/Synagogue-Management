import React, { useState, useEffect } from "react";
import { List, Typography, Button, Modal, message, Badge } from "antd";
import axios from "axios";
import API_URL from "../../config";
import { InboxOutlined, UserOutlined } from "@ant-design/icons";

const { Title } = Typography;

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/messages`);
      const sortedMessages = response.data.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      setMessages(sortedMessages);
    } catch (error) {
      message.error("שגיאה בטעינת ההודעות");
    }
    setLoading(false);
  };

  const markAsRead = async (messagee) => {
    if (!messagee.read_boolean) {
      try {
        await axios.patch(`${API_URL}/messages/${messagee.message_id}`, {
          read_boolean: true,
        });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.message_id === messagee.message_id
              ? { ...msg, read_boolean: true }
              : msg
          )
        );
      } catch (error) {
        message.error("שגיאה בעדכון הסטטוס של ההודעה");
      }
    }
  };

  const handleArchive = async (messageId) => {
    try {
      await axios.post(`${API_URL}/messages/archive`, { id: messageId });
      fetchMessages();
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      message.success("ההודעה הועברה לארכיון בהצלחה");
    } catch (error) {
      message.error("שגיאה בהעברת ההודעה לארכיון");
    }
  };

  const renderMessageDetails = () => (
    <Modal
      title={selectedMessage.subject}
      open={!!selectedMessage}
      onCancel={() => setSelectedMessage(null)}
      footer={null}
      width={600}
      style={{ textAlign: "right" }}
    >
      <div>
        <p>{selectedMessage.text}</p>
        <p>
          <strong>נשלח על ידי:</strong>{" "}
          {`${selectedMessage.first_name} ${selectedMessage.last_name}`}
        </p>
      </div>
    </Modal>
  );

  return (
    <div className="messages-container">
      <Title level={3} className="title">
        תיבת הודעות
      </Title>
      <List
        bordered
        loading={loading}
        dataSource={messages}
        locale={{ emptyText: "אין נתונים להצגה" }}
        renderItem={(message) => (
          <List.Item
            className={`message-item ${
              message.read_boolean ? "read" : "unread"
            }`}
            style={{
              paddingInlineStart: "15px",
              paddingInlineEnd: "4px",
              backgroundColor: message.read_boolean ? "#fff" : "#dadee3",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => {
              markAsRead(message);
              setSelectedMessage(message);
            }}
            actions={[
              <Button
                type="link"
                icon={<InboxOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchive(message.message_id);
                }}
              >
                ארכיון
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  dot={!message.read_boolean}
                  color="blue"
                  offset={[-10, 0]}
                >
                  <UserOutlined
                    className="profile-icon"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: "#f0f0f0",
                      fontSize: 24,
                      color: "#aaa",
                    }}
                  />
                </Badge>
              }
              title={
                <span
                  className={`message-subject ${
                    message.read_boolean ? "subject-read" : "subject-unread"
                  }`}
                >
                  {message.subject}
                </span>
              }
              description={
                <div className="message-meta">
                  <span className="message-sender">
                    {`${message.first_name} ${message.last_name}`}
                  </span>
                  <br />
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              }
            />
          </List.Item>
        )}
      />
      {selectedMessage && renderMessageDetails()}
    </div>
  );
};

export default Index;
