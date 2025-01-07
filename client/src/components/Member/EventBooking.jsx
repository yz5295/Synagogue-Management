import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  InputNumber,
  Steps,
  Card,
  Result,
  message,
  Alert,
  Tooltip,
  Switch,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/he";
import locale from "antd/es/date-picker/locale/he_IL";
import CreditCard from "../payment/CreditCard";
import "../../style/EventBooking.css";
import axios from "axios";
import SendEmail from "./SendEmail";
import { useUser } from "../../contexts/UserContext";
import API_URL from "../../config";

const { Step } = Steps;
const { Option } = Select;

const EventBooking = () => {
  const [form] = Form.useForm();
  const [events, setEvents] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [catering, setCatering] = useState(false);
  const [mealCount, setMealCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [eventType, setEventType] = useState("");
  const [bookingFinished, setBookingFinished] = useState(false);
  const [endTimeOptions, setEndTimeOptions] = useState([]);
  const [isHallAvailable, setIsHallAvailable] = useState(null);
  const [hours, setHours] = useState(0);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [bookedareDates, setBookedareDates] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [customerDetails, setCustomerDetails] = useState({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);
  const { user, settings } = useUser();

  const generateTimeOptions = (start = 8, end = 23) => {
    const options = [];
    for (let hour = start; hour <= end; hour++) {
      const time = dayjs().hour(hour).minute(0).format("HH:mm");
      options.push(time);
    }
    return options;
  };

  const generateEndTimeOptions = (start) => {
    if (!start) return [];
    const startHour = dayjs(start, "HH:mm").hour();
    const options = [];
    for (let hour = startHour + 1; hour <= 23; hour++) {
      const time = dayjs().hour(hour).minute(0).format("HH:mm");
      options.push(time);
    }
    return options;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsResponse, bookedTimesResponse] = await Promise.all([
          axios.get(`${API_URL}/eventlist/events`),
          axios.get(`${API_URL}/eventlist/booked-times`),
        ]);

        const eventsData = eventsResponse.data;
        setEvents(eventsData);

        const bookedTimesData = bookedTimesResponse.data;
        setBookedTimes(bookedTimesData);

        const dates = bookedTimesData.map((booking) => booking.date);
        const uniqueDates = [...new Set(dates)];
        setBookedDates(uniqueDates);

        const fullName = `${user.first_name} ${user.last_name}`;
        setCustomerDetails({
          name: fullName,
          email: user.email,
          phone: user.phone,
          description: "הזמנת אולם",
        });

        setDataLoaded(true);
      } catch (error) {
        console.error("שגיאה בשליפת נתונים:", error);
        message.error("שגיאה בשליפת נתונים.");
      }
    };

    fetchData();
  }, []);

  // פונקציה לבדוק זמינות האולם
  const checkHallAvailability = (date, start, end) => {
    if (end === "00:00") {
      end = "23:59";
    }

    const isBooked = bookedTimes.some(
      (booking) =>
        booking.date === date &&
        ((start >= booking.start && start < booking.end) ||
          (end > booking.start && end <= booking.end) ||
          (start <= booking.start && end >= booking.end))
    );

    setIsHallAvailable(!isBooked);
  };

  const onDateChange = (date) => {
    setSelectedDate(date);
    setStartTime(null);
    setEndTime(null);
    setIsHallAvailable(true);
    setHours(0);
    form.resetFields(["startTime", "endTime"]);
    title(date);
  };

  const onStartTimeChange = (value) => {
    setStartTime(value);
    setEndTime(null);
    form.resetFields(["endTime"]);
    // setIsHallAvailable(true);
    setHours(0);
    const options = generateEndTimeOptions(value);
    setEndTimeOptions(options);
  };

  const onEndTimeChange = (value) => {
    setEndTime(value);
    if (!selectedDate) {
      message.error("אנא בחר תאריך.");
      return;
    }
    if (startTime) {
      checkHallAvailability(
        selectedDate.format("YYYY-MM-DD"),
        startTime,
        value
      );
      const start = dayjs(startTime, "HH:mm");
      const end = dayjs(value, "HH:mm");
      const calculatedHours = end.diff(start, "hour");
      setHours(calculatedHours);
    }
  };

  const handleCateringCheck = (checked) => {
    setCatering(checked);
  };

  // חישוב סה"כ
  useEffect(() => {
    if (!settings) return;
    const hallPricePerHour = settings.hallPricePerHour || 0;
    const mealPrice = settings.pricePerPerson || 0;
    const cateringCost = catering ? mealCount * mealPrice : 0;
    const total = hallPricePerHour * hours + cateringCost;
    setTotalAmount(total);
  }, [catering, mealCount, settings, hours]);

  const title = (date) => {
    const formattedDate = date.format("YYYY-MM-DD");
    const bookingsForDate = bookedTimes.filter(
      (booking) => booking.date === formattedDate
    );
    const booked = bookingsForDate.map((booking, index) => {
      const start = dayjs(booking.start, "HH:mm:ss").format("HH:mm");
      const end = dayjs(booking.end, "HH:mm:ss").format("HH:mm");
      return `${start} - ${end} `;
    });
    console.log(booked);
    setBookedareDates(booked);
    if (bookingsForDate.length > 0) {
      setIsHallAvailable(false);
    }
  };

  // פונקציה להתאמת עיצוב התאריכים בלוח
  const dateRender = (current) => {
    const formattedDate = current.format("YYYY-MM-DD");
    const bookingsForDate = bookedTimes.filter(
      (booking) => booking.date === formattedDate
    );

    let status = "פנוי";
    let backgroundColor = "rgba(83, 196, 26, 0.49)";
    let border = "1px solid #52c41a";
    let color = "#52c41a";

    if (bookingsForDate.length > 0) {
      // setIsHallAvailable(false);
      const totalBookedHours = bookingsForDate.reduce((acc, booking) => {
        const start = dayjs(booking.start, "HH:mm");
        const end = dayjs(booking.end, "HH:mm");
        return acc + end.diff(start, "hour");
      }, 0);

      const totalDayHours = 15;

      if (totalBookedHours >= totalDayHours) {
        // תפוס לחלוטין
        status = "תפוס";
        backgroundColor = "rgba(255, 77, 80, 0.52)";
        border = "1px solid rgb(255, 77, 80)";
        color = " rgb(255, 77, 80)";
      } else {
        // תפוס חלקית
        status = "תפוס חלקית";
        backgroundColor = "rgba(250, 173, 20, 0.52)";
        border = "1px solid #faad14";
        color = " #faad14";
      }
    }

    return (
      <Tooltip title={status}>
        <div
          onClick={() => setBookedareDates(formattedDate)}
          style={{
            backgroundColor,
            // color: "#fff",
            fontWeight: "500",
            padding: "3px",
            margin: "2px",
            borderRadius: "4px",
            textAlign: "center",
            cursor: "pointer",
            border,
            // color,
          }}
        >
          {current.date()}
        </div>
      </Tooltip>
    );
  };

  const handleEventTypeChange = (value) => {
    setEventType(value);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      form
        .validateFields()
        .then((values) => {
          if (isHallAvailable) {
            console.log("תאריך:", selectedDate.format("YYYY-MM-DD"));
            console.log("שעת התחלה:", startTime);
            console.log("שעת סיום:", endTime);

            setCurrentStep(1);
          } else {
            message.error(
              "האולם אינו פנוי בתאריך ובשעה שנבחרו. אנא בחר תאריך ושעה אחרים."
            );
          }
        })
        .catch((info) => {
          console.log("Validate Failed:", info);
        });
    } else if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handlePayment();
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePaymentSuccess = () => {
    if (Object.keys(customerDetails).length === 0) {
      message.error("שגיאה: פרטי משתמש חסרים. התחבר מחדש ונסה שוב.");
      return;
    }
    setPaymentSuccess(true);
    handleNext();
  };

  const handlePayment = async () => {
    const bookingData = {
      date: selectedDate.format("YYYY-MM-DD"),
      eventType: eventType,
      startTime: startTime,
      endTime: endTime,
      catering: catering,
      mealCount: mealCount,
      amount: totalAmount,
      hours: hours,
      user: user,
      orderDate: dayjs().format("YYYY-MM-DD"),
    };

    try {
      const response = await axios.post(
        `${API_URL}/eventlist/bookings`,
        bookingData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setBookingFinished(true);
        setSendEmail(true);
      } else {
        message.error("שגיאה בשמירת ההזמנה");
      }
    } catch (error) {
      console.error("שגיאה בשמירת ההזמנה:", error);
      message.error("שגיאה בשמירת ההזמנה");
    }
  };

  if (!settings || !dataLoaded) {
    return <div>טוען...</div>;
  }

  const steps = [
    {
      title: "פרטי אירוע",
      content: (
        <Form form={form} layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item
            label="תאריך האירוע"
            name="date"
            rules={[{ required: true, message: "בחר תאריך" }]}
          >
            <DatePicker
              locale={locale}
              format="YYYY-MM-DD"
              placeholder="בחר תאריך"
              disabledDate={(current) => {
                return current && current.isBefore(dayjs().startOf("day"));
              }}
              onChange={onDateChange}
              value={selectedDate}
              style={{ width: "100%" }}
              dateRender={dateRender}
            />
          </Form.Item>
          <Form.Item
            label="סוג האירוע"
            name="eventType"
            rules={[{ required: true, message: "בחר סוג אירוע" }]}
          >
            <Select
              onChange={handleEventTypeChange}
              value={eventType}
              placeholder="בחר סוג אירוע"
            >
              <Option value="ברית">ברית</Option>
              <Option value="בר מצווה">בר מצווה</Option>
              <Option value="אירוסין">אירוסין</Option>
              <Option value="שבע ברכות">שבע ברכות</Option>
              <Option value="פדיון הבן">פדיון הבן</Option>
              <Option value="אחר">אחר</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="שעת התחלה"
            name="startTime"
            rules={[{ required: true, message: "אנא בחר שעת התחלה" }]}
          >
            <Select onChange={onStartTimeChange} placeholder="בחר שעת התחלה">
              {generateTimeOptions(8, 22).map((time) => (
                <Option key={time} value={time}>
                  {time}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="שעת סיום"
            name="endTime"
            rules={[{ required: true, message: "אנא בחר שעת סיום" }]}
          >
            <Select
              onChange={onEndTimeChange}
              placeholder="בחר שעת סיום"
              disabled={!startTime}
            >
              {endTimeOptions.map((time) => (
                <Option key={time} value={time}>
                  {time}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {isHallAvailable !== null && (
            <Form.Item>
              <Alert
                message={
                  isHallAvailable
                    ? "האולם פנוי"
                    : `האולם תפוס, בין השעות ${bookedareDates}`
                }
                type={isHallAvailable ? "success" : "error"}
                showIcon
              />
            </Form.Item>
          )}

          <div
            style={{
              minHeight: 50,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <Form.Item style={{ marginTop: 0, marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Switch checked={catering} onChange={handleCateringCheck} />
                <span style={{ marginRight: "8px", marginLeft: "8px" }}>
                  האם להוסיף קייטרינג?
                </span>
              </div>
            </Form.Item>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                visibility: catering ? "visible" : "hidden",
                backgroundColor: "rgba(237, 233, 233, 0.54)",
                borderRadius: "5px",
                padding: "10px",
              }}
            >
              <label style={{ margin: 0, fontWeight: "500" }}>מספר מנות:</label>
              <Form.Item
                name="mealCount"
                rules={[{ required: catering, message: "אנא הזן מספר מנות" }]}
                style={{
                  margin: 0,
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
              >
                <InputNumber
                  min={1}
                  onChange={setMealCount}
                  disabled={!catering}
                />
              </Form.Item>
            </div>
          </div>
        </Form>
      ),
    },
    {
      title: "סיכום והצעת מחיר",
      content: (
        <Card style={{ maxWidth: 500, margin: "0 auto" }}>
          <h3>סיכום הזמנה</h3>
          <p>
            <strong>אולמי בית הכנסת {settings.synagogueName}</strong>
          </p>
          <p>
            הזמנה מאת: {user.first_name} {user.last_name}
          </p>
          <p>סוג האירוע: {eventType}</p>
          <p>בתאריך: {selectedDate ? selectedDate.format("DD-MM-YYYY") : ""}</p>
          <p>
            משעה: {startTime ? startTime : ""} עד שעה: {endTime ? endTime : ""}
          </p>
          <p>מספר שעות: {hours}</p>
          <p>
            טלפון: {user.phone} | דוא"ל: {user.email}
          </p>
          <p>מחיר האולם: {hours * settings.hallPricePerHour} ₪</p>
          {catering && (
            <>
              <p>{`מחיר הקייטרינג: ${
                mealCount * settings.pricePerPerson
              } ₪`}</p>
              <p>{`מספר מנות: ${mealCount}`}</p>
            </>
          )}

          <hr />
          <h4>סה"כ לתשלום: {totalAmount} ₪</h4>
        </Card>
      ),
    },
    {
      title: "פרטי תשלום",
      content: (
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h3>הזן פרטי תשלום</h3>
          <CreditCard
            amount={totalAmount}
            onPaymentSuccess={handlePaymentSuccess}
            customerDetails={customerDetails}
          />
        </div>
      ),
    },
  ];
  const emailSummary = `
  <div style="max-width: 600px; margin: 20px auto; padding: 25px; border-radius: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f9f9f9; border: 1px solid #ddd;">
    <header style="border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 15px;">
      <h1 style="margin: 0; font-size: 20px; color: #333;">סיכום הזמנה</h1>
      <p style="margin: 5px 0; color: #777; font-size: 13px;">${
        selectedDate ? selectedDate.format("DD-MM-YYYY") : ""
      }</p>
    </header>
    <section style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>אולמי בית הכנסת:</strong> ${
        settings.synagogueName
      }</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>שם המזמין:</strong> ${
        user.first_name
      } ${user.last_name}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>סוג האירוע:</strong> ${eventType}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>תאריך האירוע:</strong> ${
        selectedDate ? selectedDate.format("DD-MM-YYYY") : ""
      }</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>שעות האירוע:</strong> ${
        startTime ? startTime : ""
      } עד ${endTime ? endTime : ""}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>מספר שעות:</strong> ${hours}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>פרטי התקשרות:</strong> ${
        user.phone
      } | ${user.email}</p>
      <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>מחיר האולם:</strong> ${
        hours * settings.hallPricePerHour
      } ₪</p>
      ${
        catering
          ? `
            <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>מחיר הקייטרינג:</strong> ${
              mealCount * settings.pricePerPerson
            } ₪</p>
            <p style="margin: 8px 0; font-size: 14px; color: #333;"><strong>מספר מנות:</strong> ${mealCount}</p>
          `
          : ""
      }
    </section>
    <section style="margin-top: 15px; background-color: #f7f7f7; padding: 15px; border-radius: 8px; border: 1px solid #ddd; text-align: center;">
      <h2 style="margin: 0; font-size: 18px; color: #222;">סה"כ לתשלום</h2>
      <p style="margin: 10px 0 0; font-size: 16px; color: #555; font-weight: bold;">${totalAmount} ₪</p>
    </section>
    <footer style="margin-top: 20px; text-align: center; font-size: 11px; color: #888;">
      <p style="margin: 0;">תודה רבה על הזמנתך.</p>
      <p style="margin: 0;">בברכה, הנהלת בית הכנסת ${settings.synagogueName}</p>
    </footer>
  </div>
`;

  return (
    <div style={{ padding: 20 }}>
      <>
        <Steps current={currentStep} style={{ marginBottom: 30 }}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div style={{ marginBottom: 24 }}>{steps[currentStep].content}</div>
        <div style={{ textAlign: "right" }}>
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <Button style={{ marginRight: 8 }} onClick={handlePrev}>
              חזרה
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              הבא
            </Button>
          )}
        </div>

        {sendEmail && (
          <SendEmail
            to={user.email}
            subject={`סיכום הזמנה אולמי בית הכנסת ${settings.synagogueName}`}
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
      </>
      {/* ) : (
        <Result
          status="success"
          title="הזמנה בוצעה בהצלחה"
          subTitle="פרטי ההזמנה נשלחו לכם למייל. תודה שבחרתם בנו!"
        />
      )} */}
    </div>
  );
};

export default EventBooking;
