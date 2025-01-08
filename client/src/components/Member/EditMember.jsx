import React, { useEffect, useState } from "react";
import { Form, Input, Button, message, Card, Switch, Result } from "antd";
import axios from "axios";
import API_URL from "../../config";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

const EditMember = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [changePassword, setChangePassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(null);
  const { user, setUser, token } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      form.setFieldsValue(user);
      setLoading(false);
    }
  }, [user, token, form]);
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
        `${API_URL}/users/${user.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setIsSuccess(true);
        setUser({ ...user, ...userDetails });
      } else {
        setIsSuccess(false);
      }
    } catch (error) {
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }

    form.setFieldsValue({
      newPassword: "",
      confirmPassword: "",
    });
    setChangePassword(false);
  };

  const handleBack = () => {
    navigate("/member");
  };

  // if (!user) {
  //   return <p>טוען נתונים...</p>;
  // }

  if (isSuccess !== null) {
    return (
      <Result
        status={isSuccess ? "success" : "error"}
        title={
          isSuccess ? "פרטי המשתמש עודכנו בהצלחה!" : "שגיאה בעדכון פרטי המשתמש."
        }
        extra={[
          <Button type="primary" onClick={handleBack}>
            חזור
          </Button>,
        ]}
      />
    );
  }

  return (
    <Card
      title="עריכת פרטי משתמש"
      loading={loading}
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
          <div style={{ display: "flex", alignItems: "center" }}>
            <Switch
              checked={changePassword}
              onChange={(checked) => setChangePassword(checked)}
            />
            <span style={{ marginRight: "8px" }}>לשנות סיסמה</span>
          </div>
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
