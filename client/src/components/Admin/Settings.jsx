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
  Switch,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../contexts/SettingsContext";
import API_URL from "../../config";

const Settings = () => {
  const [form] = Form.useForm();
  const [changePassword, setChangePassword] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { settings, setSettings, loading } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    if (settings) {
      const { administratorPassword, confirmPassword, ...filteredSettings } =
        settings;
      form.setFieldsValue(filteredSettings);
    }
  }, [form, settings]);

  const handleSave = async (values) => {
    try {
      const { administratorPassword, confirmPassword, ...filteredSettings } =
        values;

      const updateData = { ...filteredSettings };

      if (changePassword) {
        if (!administratorPassword) {
          message.error("אנא הזן סיסמת ניהול חדשה");
          return;
        }
        updateData.administratorPassword = administratorPassword;
      }

      await axios.put(`${API_URL}/settings`, updateData);

      setIsSaved(true);
      setSettings(values);
    } catch (error) {
      message.error("שגיאה בשמירת ההגדרות");
    }
  };

  const resetForm = () => {
    navigate("/admin");
  };

  if (loading || !settings) {
    return <Spin size="large" tip="טוען הגדרות..." />;
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      {isSaved ? (
        <Result
          status="success"
          title="הגדרות נשמרו בהצלחה!"
          subTitle="הנתונים הועברו לשרת ונשמרו בקובץ ההגדרות."
          extra={[
            <Button type="primary" onClick={resetForm} key="reset">
              חזור
            </Button>,
          ]}
        />
      ) : (
        <>
          <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
            ניהול הגדרות בית כנסת
          </h1>
          <Form form={form} layout="vertical" onFinish={handleSave}>
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
              <Col span={12}>
                <Form.Item
                  name="synagogueAddress"
                  label="כתובת בית הכנסת"
                  rules={[
                    { required: true, message: "אנא הזן את כתובת בית הכנסת" },
                  ]}
                >
                  <Input placeholder="הזן את כתובת בית הכנסת" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="synagogueCity"
                  label="עיר בית הכנסת"
                  rules={[
                    { required: true, message: "אנא הזן את עיר בית הכנסת" },
                  ]}
                >
                  <Input placeholder="הזן את עיר בית הכנסת" />
                </Form.Item>
              </Col>
            </Row>
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
            <Form.Item name="changePassword" valuePropName="checked">
              <div style={{ display: "flex", alignItems: "center" }}>
                <Switch
                  checked={changePassword}
                  onChange={(checked) => setChangePassword(checked)}
                />
                <span style={{ marginRight: "8px" }}>לשנות סיסמה</span>
              </div>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="administratorPassword"
                  label="סיסמת ניהול חדשה"
                  rules={[
                    {
                      required: changePassword,
                      message: "יש להזין סיסמת ניהול חדשה",
                    },
                    { min: 6, message: "הסיסמה חייבת להכיל לפחות 6 תווים" },
                  ]}
                >
                  <Input.Password
                    placeholder="הזן סיסמת ניהול חדשה"
                    disabled={!changePassword}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="אימות סיסמת הניהול"
                  dependencies={["administratorPassword"]}
                  rules={[
                    {
                      required: changePassword,
                      message: "יש לאמת את סיסמת הניהול",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (
                          !value ||
                          getFieldValue("administratorPassword") === value
                        ) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("הסיסמאות אינן תואמות")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    placeholder="אמת את סיסמת הניהול"
                    disabled={!changePassword}
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
