import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Card, Checkbox } from "antd";
import axios from "axios";
import API_URL from "../../config";

const EditMember = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [changePassword, setChangePassword] = useState(false);

  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user);
        console.log(response.data.user);

        form.setFieldsValue(response.data.user);
      } catch (error) {
        message.error("שגיאה בשליפת פרטי המשתמש.");
      }
    };

    fetchUser();
  }, [token, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const { newPassword, confirmPassword, ...userDetails } = values;

      if (changePassword) {
        if (newPassword !== confirmPassword) {
          message.error("הסיסמאות אינן תואמות. נסה שוב.");
          setLoading(false);
          return;
        }
      }

      const updateData = { ...userDetails };

      if (changePassword && newPassword) {
        updateData.password = newPassword;
      }

      const response = await axios.put(
        `${API_URL}/api/users/${user.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        message.success("פרטי המשתמש עודכנו בהצלחה!");
      } else {
        message.error("שגיאה בעדכון פרטי המשתמש.");
      }
    } catch (error) {
      message.error("שגיאה בעדכון פרטי המשתמש.");
    } finally {
      setLoading(false);
    }

    form.setFieldsValue({
      newPassword: "",
      confirmPassword: "",
    });
    setChangePassword(false);
  };

  if (!user) {
    return <p>טוען נתונים...</p>;
  }

  return (
    <Card
      title="עריכת פרטי משתמש"
      style={{
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
      }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          city: user.city,
          phone: user.phone,
          email: user.email,
        }}
      >
        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            label="שם פרטי"
            name="first_name"
            rules={[{ required: true, message: "יש להזין שם פרטי" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="שם פרטי" />
          </Form.Item>
          <Form.Item
            label="שם משפחה"
            name="last_name"
            rules={[{ required: true, message: "יש להזין שם משפחה" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="שם משפחה" />
          </Form.Item>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            label="כתובת"
            name="address"
            rules={[{ required: true, message: "יש להזין כתובת" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="כתובת" />
          </Form.Item>
          <Form.Item
            label="עיר"
            name="city"
            rules={[{ required: true, message: "יש להזין עיר" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="עיר" />
          </Form.Item>
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          <Form.Item
            label="טלפון"
            name="phone"
            rules={[{ required: true, message: "יש להזין מספר טלפון" }]}
            style={{ flex: 1 }}
          >
            <Input placeholder="טלפון" />
          </Form.Item>
          <Form.Item
            label="כתובת מייל"
            name="email"
            rules={[
              { required: true, message: "יש להזין כתובת מייל" },
              { type: "email", message: "יש להזין כתובת מייל תקינה" },
            ]}
            style={{ flex: 1 }}
          >
            <Input placeholder="כתובת מייל" />
          </Form.Item>
        </div>

        <Form.Item name="changePassword" valuePropName="checked">
          <Checkbox
            checked={changePassword}
            onChange={(e) => setChangePassword(e.target.checked)}
          >
            לשנות סיסמה
          </Checkbox>
        </Form.Item>

        {changePassword && (
          <div style={{ display: "flex", gap: "16px" }}>
            <Form.Item
              label="סיסמה חדשה"
              name="newPassword"
              rules={[
                { required: true, message: "יש להזין סיסמה חדשה" },
                { min: 6, message: "הסיסמה חייבת להכיל לפחות 6 תווים" },
              ]}
              style={{ flex: 1 }}
            >
              <Input.Password placeholder="סיסמה חדשה" />
            </Form.Item>
            <Form.Item
              label="אימות סיסמה"
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "יש לאמת את הסיסמה" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("הסיסמאות אינן תואמות"));
                  },
                }),
              ]}
              style={{ flex: 1 }}
            >
              <Input.Password placeholder="אימות סיסמה" />
            </Form.Item>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          <Button type="primary" htmlType="submit" loading={loading}>
            שמור שינויים
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default EditMember;
