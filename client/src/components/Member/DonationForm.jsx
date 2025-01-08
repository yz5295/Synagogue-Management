import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, message, Result, Card } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/he";
import CreditCard from "../payment/CreditCard";
import API_URL from "../../config";
import { useUser } from "../../contexts/UserContext";
const { Option } = Select;

const DonationForm = () => {
  const [form] = Form.useForm();
  const [result, setResult] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [donationData, setDonationData] = useState({});
  const [customerDetails, setCustomerDetails] = useState({});
  const [sendEmail, setSendEmail] = useState(false);
  const { user, settings } = useUser();
  const date = new Date().toISOString();

  useEffect(() => {
    if (user) {
      const fullName = `${user.first_name} ${user.last_name}`;
      setCustomerDetails({
        name: fullName,
        email: user.email,
        phone: user.phone,
        description: "תרומה",
      });
    }
  }, [user]);

  const onFinishDonation = (values) => {
    setDonationData(values);
    setCurrentStep(2);
  };

  const handlePaymentSuccess = () => {
    if (!user) {
      message.error("שגיאה: פרטי משתמש חסרים. התחבר מחדש ונסה שוב.");
      return;
    }
    setPaymentSuccess(true);
    onFinishPayment();
  };

  const onFinishPayment = async () => {
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
  <div style="max-width: 600px; margin: 20px auto; padding: 25px; border-radius: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f9f9f9; border: 1px solid #ddd;">
    <header style="border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 15px;">
      <h1 style="margin: 0; font-size: 20px; color: #333;">סיכום תרומה לבית הכנסת</h1>
      <p style="margin: 5px 0; color: #777; font-size: 13px;">${dayjs(
        date
      ).format("DD-MM-YYYY")}</p>
    </header>
    <section style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>בית הכנסת:</strong> ${
        settings.synagogueName
      }</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>שם התורם:</strong> ${
        user.first_name
      } ${user.last_name}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>מטרת התרומה:</strong> ${
        donationData.purpose
      }</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>פרטי התקשרות:</strong> ${
        user.phone
      } | ${user.email}</p>
    </section>
    <section style="margin-top: 15px; background-color: #f7f7f7; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
      <h2 style="margin: 0; font-size: 18px; color: #222;">סה"כ לתשלום</h2>
      <p style="margin: 10px 0 0; font-size: 16px; color: #555; font-weight: bold;">${
        donationData.amount
      } ₪</p>
    </section>
    <footer style="margin-top: 20px; text-align: center; font-size: 11px; color: #888;">
      <p style="margin: 0;">תודה רבה על תרומתך לבית הכנסת.</p>
      <p style="margin: 0;">בברכה, הנהלת בית הכנסת ${settings.synagogueName}</p>
    </footer>
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
                subject={`סיכום תרומה בית הכנסת ${settings.synagogueName}`}
                text={emailSummary}
              />
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default DonationForm;
