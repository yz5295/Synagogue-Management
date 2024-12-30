import React, { useState, useEffect } from "react";
import { Form, Input, InputNumber, Button, Result, Row, Col, message } from "antd";
import axios from "axios";

const Settings = () => {
  const [form] = Form.useForm();
  const [isSaved, setIsSaved] = useState(false);
  const savedSettings = JSON.parse(localStorage.getItem("settings")) || {};

  useEffect(() => {
    form.setFieldsValue(savedSettings);
  }, [form]);

  const onFinish = async (values) => {
    try {
      await axios.post("/settings", values);
      setIsSaved(true);
    } catch (error) {
      setIsSaved(false);
      message.error("שגיאה בשמירת ההגדרות");
    }

    localStorage.setItem("settings", JSON.stringify(values));
    window.dispatchEvent(new Event("settingsUpdated"));
  };

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue(savedSettings);
    setIsSaved(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {isSaved ? (
        <Result
          status="success"
          title="הגדרות נשמרו בהצלחה!"
          subTitle="הנתונים הועברו לשרת ונשמרו בקובץ ההגדרות."
          extra={[
            <Button type="primary" onClick={resetForm} key="edit">
              ערוך שוב
            </Button>,
          ]}
        />
      ) : (
        <>
          <h1 style={{ textAlign: "center" }}>ניהול הגדרות בית כנסת</h1>
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="synagogueName"
                  label="שם בית הכנסת"
                  rules={[{ required: true, message: "אנא הזן שם בית כנסת" }]}
                >
                  <Input placeholder="הזן את שם בית הכנסת" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="managerName"
                  label="שם גבאי בית הכנסת"
                  rules={[{ required: true, message: "אנא הזן שם גבאי" }]}
                >
                  <Input placeholder="הזן את שם גבאי בית הכנסת" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="administratorPassword"
              label="סיסמת הניהול"
              rules={[{ required: true, message: "אנא הזן את סיסמת הניהול" }]}
            >
              <Input.Password placeholder="הזן את סיסמת הניהול" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="אישור סיסמה"
              dependencies={["administratorPassword"]}
              rules={[
                { required: true, message: "אנא אשר את סיסמת הניהול" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (
                      !value ||
                      getFieldValue("administratorPassword") === value
                    ) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("הסיסמאות לא תואמות"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="אשר את סיסמת הניהול" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="hallPricePerHour"
                  label="מחיר האולם לשעה"
                  rules={[
                    { required: true, message: "אנא הזן מחיר האולם לשעה" },
                  ]}
                >
                  <InputNumber
                    placeholder="הזן מחיר"
                    min={0}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="pricePerPerson"
                  label="מחיר מנה"
                  rules={[{ required: true, message: "אנא הזן מחיר למנה" }]}
                >
                  <InputNumber
                    placeholder="הזן מחיר למנה"
                    min={0}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                שמור
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
    </div>
  );
};

export default Settings;
