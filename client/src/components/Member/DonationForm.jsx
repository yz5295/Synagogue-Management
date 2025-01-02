// src/DonationForm.js
import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Result, Card } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/he";
import CreditCard from "../payment/CreditCard";
import SendEmail from "./SendEmail";
import API_URL from "../../config";
const { Option } = Select;

const DonationForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [user, setUser] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [donationData, setDonationData] = useState({});
  const [customerDetails, setCustomerDetails] = useState({});
  const [sendEmail, setSendEmail] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [settings, setSettings] = useState({});
  const date = new Date().toISOString();

  useEffect(() => {
    const fetchUserDetails = async () => {
      const settingsResponse = await fetch(`${API_URL}/settings`);
      const settingsData = await settingsResponse.json();
      setSettings(settingsData);

      const token = JSON.parse(localStorage.getItem("token"));

      if (!token) {
        throw new Error("שגיאה: פרטי משתמש חסרים. התחבר מחדש ונסה שוב.");
      }

      try {
        const userResponse = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.status !== 200) {
          throw new Error("שגיאה בשליפת פרטי המשתמש");
        }

        setUser(userResponse.data.user);
        setUserEmail(userResponse.data.user.email);
        const fullName = `${userResponse.data.user.first_name} ${userResponse.data.user.last_name}`;

        setCustomerDetails({
          name: fullName,
          email: userResponse.data.user.email,
          phone: userResponse.data.user.phone,
          description: "תרומה",
        });
      } catch (error) {
        console.error("שגיאה בשליפת פרטי המשתמש:");
      }
    };
    fetchUserDetails();
  }, []);

  const onFinishDonation = (values) => {
    setDonationData(values);
    setCurrentStep(2);
  };

  const handlePaymentSuccess = () => {
    if (Object.keys(customerDetails).length === 0) {
      message.error("שגיאה: פרטי משתמש חסרים. התחבר מחדש ונסה שוב.");
      return;
    }
    setPaymentSuccess(true);
    onFinishPayment();
  };

  const onFinishPayment = async () => {
    setLoading(true);
    setResult("");
    setShowResult(false);

    const completeDonationData = {
      ...donationData,
      user,
      date,
      paymentIntent,
    };

    const response = await axios.post(
      `${API_URL}/donation`,
      completeDonationData
    );

    if (response.status === 200) {
      setResult("התשלום התקבל בהצלחה!");
      form.resetFields();
      setSendEmail(true);
    } else {
      setResult("שגיאה בתהליך התשלום. נסה שוב.");
    }
  };

  const resetForm = () => {
    setShowResult(false);
    setResult("");
    setPaymentSuccess(false);
    setPaymentIntent(null);
    setCurrentStep(1);
  };

  const emailSummary = `
  <div style="max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif; direction: rtl; text-align: right;">
    <h3 style="margin-top: 0; color: #333;">סיכום תרומה לבית הכנסת</h3>
    <p><strong> בית הכנסת ${settings.synagogueName}</strong></p>
    <p>תרומה מאת: ${user.first_name} ${user.last_name}</p>
    <p>מטרת התרומה: ${donationData.purpose}</p>
     <p>בתאריך: ${dayjs(date).format("DD-MM-YYYY")}</p>
    <p>טלפון: ${user.phone} | דוא"ל: ${user.email}</p>
    <hr style="margin: 15px 0; border: none; border-top: 1px solid #ccc;" />
    <h3 style="margin: 5px 0; color: #000;">סה"כ לתשלום: ${
      donationData.amount
    } ₪</h3>
  </div>
  `;

  return (
    <Card
      style={{
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        maxWidth: "500px",
        margin: "auto",
        padding: "20px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>טופס תרומה</h2>
      {showResult && (
        <Result
          status={paymentSuccess ? "success" : "error"}
          title={result}
          extra={[
            <Button type="primary" key="reset" onClick={resetForm}>
              חזור
            </Button>,
          ]}
        />
      )}
      {!showResult && (
        <>
          {currentStep === 1 && (
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinishDonation}
              style={{
                backgroundColor: "#f9f9f9",
                padding: 20,
                borderRadius: 10,
              }}
            >
              <Form.Item
                name="amount"
                label="סכום התרומה"
                rules={[
                  { required: true, message: "נא למלא את סכום התרומה" },
                  { pattern: /^\d+$/, message: "נא להזין מספר חוקי" },
                  {
                    validator: (_, value) =>
                      value >= 3
                        ? Promise.resolve()
                        : Promise.reject("סכום התרומה המינימלי הוא 3 ש״ח"),
                  },
                ]}
              >
                <Input placeholder="הכנס סכום" type="number" min="1" />
              </Form.Item>

              <Form.Item
                name="purpose"
                label="ייעוד התרומה"
                rules={[{ required: true, message: "נא לבחור ייעוד לתרומה" }]}
              >
                <Select placeholder="בחר ייעוד">
                  <Option value="נדרים ונדבות">נדרים ונדבות</Option>
                  <Option value="עליות וכיבודים">עליות וכיבודים</Option>
                  <Option value="אבות ובנים">אבות ובנים</Option>
                  <Option value="פינת קפה">פינת קפה</Option>
                  <Option value="אוצר הספרים">אוצר הספרים</Option>
                  <Option value="החזקה כללית">החזקה כללית</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  המשך לתשלום
                </Button>
              </Form.Item>
            </Form>
          )}

          {currentStep === 2 && (
            <div className="payment-form">
              <h3 style={{ textAlign: "center" }}>
                סכום לתשלום: {donationData.amount} ש"ח
              </h3>
              <CreditCard
                amount={donationData.amount}
                onPaymentSuccess={handlePaymentSuccess}
                customerDetails={customerDetails}
              />
              {/* <Button
                type="default"
                onClick={() => setCurrentStep(1)}
                style={{ marginTop: "20px" }}
                block
              >
                חזור לעריכת התרומה
              </Button> */}
              {sendEmail && (
                <SendEmail
                  to={userEmail}
                  subject={`סיכום תרומה בית הכנסת ${settings.synagogueName}`}
                  text={emailSummary}
                  onComplete={(success) => {
                    if (success) {
                      console.log("Email sent successfully");
                    } else {
                      console.log("Failed to send email");
                    }
                    setSendEmail(false);
                  }}
                />
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default DonationForm;
