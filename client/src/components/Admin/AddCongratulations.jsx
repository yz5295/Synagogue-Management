import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Input, List, message as antdMessage, Space } from "antd";
import API_URL from "../../config";

const AddCongratulations = () => {
  const [congratulations, setCongratulations] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/congratulations`);
      setCongratulations(response.data);
    } catch (error) {
      antdMessage.error("שגיאה בטעינת ההודעות");
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async () => {
    if (congratulations.length >= 5) {
      antdMessage.warning("לא ניתן להוסיף יותר מחמש הודעות");
      return;
    }
    if (!newMessage.trim()) {
      antdMessage.warning("לא ניתן להוסיף הודעה ריקה");
      return;
    }
    try {
      const response = await axios.post(
        `${API_URL}/congratulations`,
        {
          message: newMessage,
        }
      );
      setCongratulations((prev) => [...prev, response.data]);
      setNewMessage("");
      antdMessage.success("ההודעה נוספה בהצלחה");
    } catch (error) {
      antdMessage.error("שגיאה בהוספת ההודעה");
    }
  };

  const deleteMessage = async (id) => {
    try {
      await axios.delete(`${API_URL}/congratulations/${id}`);
      setCongratulations((prev) => prev.filter((msg) => msg.id !== id));
      antdMessage.success("ההודעה נמחקה בהצלחה");
    } catch (error) {
      antdMessage.error("שגיאה במחיקת ההודעה");
    }
  };

  const editMessage = (id, message) => {
    setEditingId(id);
    setEditedMessage(message);
  };

  const saveEditedMessage = async () => {
    if (!editedMessage.trim()) {
      antdMessage.warning("לא ניתן לשמור הודעה ריקה");
      return;
    }
    try {
      const response = await axios.put(
        `${API_URL}/congratulations/${editingId}`,
        {
          message: editedMessage,
        }
      );
      setCongratulations((prev) =>
        prev.map((msg) => (msg.id === editingId ? response.data : msg))
      );
      setEditingId(null);
      setEditedMessage("");
      antdMessage.success("ההודעה עודכנה בהצלחה");
    } catch (error) {
      antdMessage.error("שגיאה בעדכון ההודעה");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>מזל טוב</h1>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input.TextArea
          rows={2}
          placeholder="הוסף הודעת מזל טוב"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button type="primary" onClick={addMessage} block>
          הוסף הודעה
        </Button>
        <List
          locale={{ emptyText: "אין נתונים להצגה" }}
          loading={loading}
          bordered
          dataSource={congratulations}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={() => editMessage(item.id, item.message)}
                >
                  ערוך
                </Button>,
                <Button
                  type="link"
                  danger
                  onClick={() => deleteMessage(item.id)}
                >
                  מחק
                </Button>,
              ]}
            >
              {editingId === item.id ? (
                <div style={{ width: "100%" }}>
                  <Input.TextArea
                    rows={1}
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                  />
                  <Button
                    type="primary"
                    onClick={saveEditedMessage}
                    style={{ marginTop: 5 }}
                  >
                    שמור
                  </Button>
                </div>
              ) : (
                item.message
              )}
            </List.Item>
          )}
        />
      </Space>
    </div>
  );
};

export default AddCongratulations;
