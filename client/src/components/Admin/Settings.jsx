import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Button,
  Result,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import API_URL from "../../config";

const Settings = () => {
  const [form] = Form.useForm();
  const [isSaved, setIsSaved] = useState(false);

  const { settings, setSettings, loading } = useSettings();

  const navigate = useNavigate();

  useEffect(() => {
    if (loading) {
      return;
    }
    const { administratorPassword, confirmPassword, ...filteredSettings } =
      settings;
    form.setFieldsValue(filteredSettings);
  }, [loading, settings]);

  const onFinish = async (values) => {
    try {
      await axios.post(`${API_URL}/settings`, values);
      setIsSaved(true);
      setSettings(values);
    } catch (error) {
      setIsSaved(false);
      message.error("שגיאה בשמירת ההגדרות");
    }
  };

  const resetForm = () => {
    navigate("/admin");
    // form.resetFields();
    // setIsSaved(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {isSaved ? (
        <Result
          status="success"
          title="הגדרות נשמרו בהצלחה!"
          subTitle="הנתונים הועברו לשרת ונשמרו בקובץ ההגדרות."
          extra={[
            <Button type="primary" onClick={resetForm}>
              חזור
            </Button>,
          ]}
        />
      ) : (
        <>
          <h1 style={{ textAlign: "center" }}>ניהול הגדרות בית כנסת</h1>
          <Spin spinning={loading}>
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
          </Spin>
        </>
      )}
    </div>
  );
};

export default Settings;
