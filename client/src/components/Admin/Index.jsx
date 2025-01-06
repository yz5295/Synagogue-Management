import React, { useState, useEffect } from "react";
import { List, Typography, Button, Modal, message } from "antd";
import axios from "axios";
import API_URL from "../../config";

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
      console.log(sortedMessages);
    } catch (error) {
      message.error("שגיאה בטעינת ההודעות");
    }
    setLoading(false);
  };

  const markAsRead = async (messagee) => {
    console.log(messagee.message_id);

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
        fetchMessages();
      } catch (error) {
        message.error("שגיאה בעדכון הסטטוס של ההודעה");
      }
    }
  };

  const handleArchive = async (messageId) => {
    try {
      await axios.post(`${API_URL}/messages/archive`, { id: messageId });
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      message.success("ההודעה הועברה לארכיון בהצלחה");
    } catch (error) {
      message.error("שגיאה בהעברת ההודעה לארכיון");
    }
    fetchMessages();
  };

  const renderMessageDetails = () => (
    <Modal
      title={selectedMessage.subject}
      open={!!selectedMessage}
      onCancel={() => setSelectedMessage(null)}
      footer={null}
    >
      <p>
        <strong>נשלח על ידי:</strong>{" "}
        {`${selectedMessage.first_name} ${selectedMessage.last_name}`}
      </p>
      <p>{selectedMessage.text}</p>
    </Modal>
  );

  return (
    <div style={{ padding: 16 }}>
      <Title level={3}>תיבת הודעות</Title>
      <List
        bordered
        loading={loading}
        dataSource={messages}
        locale={{ emptyText: "אין נתונים להצגה" }}
        renderItem={(message) => (
          <List.Item
            style={{
              backgroundColor: message.read_boolean ? "#fff" : "#f0f2f5",
              cursor: "pointer",
            }}
            onClick={() => {
              markAsRead(message);
              setSelectedMessage(message);
            }}
            actions={[
              <Button
                type="link"
                onClick={(e) => {
                  e.stopPropagation();
                  handleArchive(message.message_id);
                }}
              >
                העבר לארכיון
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={message.subject}
              description={`${message.first_name} ${
                message.last_name
              } - ${new Date(message.timestamp).toLocaleString()}`}
            />
          </List.Item>
        )}
      />
      {selectedMessage && renderMessageDetails()}
    </div>
  );
};

export default Index;
