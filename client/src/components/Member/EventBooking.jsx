import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  Checkbox,
  InputNumber,
  Steps,
  Card,
  Result,
  message,
  Alert,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import "dayjs/locale/he";
import locale from "antd/es/date-picker/locale/he_IL";
import CreditCard from "../payment/CreditCard";
import "../../style/EventBooking.css";
import axios from "axios";
import SendEmail from "./SendEmail";
import API_URL from "../../config";

const { Step } = Steps;
const { Option } = Select;

const EventBooking = () => {
  const [form] = Form.useForm();
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);
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
  const [user, setUser] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [customerDetails, setCustomerDetails] = useState({});
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  const token = JSON.parse(localStorage.getItem("token"));

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
        const eventsResponse = await fetch(`${API_URL}/eventlist/events`);
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);

        const settingsResponse = await fetch(`${API_URL}/settings`);
        const settingsData = await settingsResponse.json();
        setSettings(settingsData);

        const bookedTimesResponse = await fetch(
          `${API_URL}/eventlist/booked-times`
        );
        const bookedTimesData = await bookedTimesResponse.json();
        setBookedTimes(bookedTimesData);

        const dates = bookedTimesData.map((booking) => booking.date);
        const uniqueDates = [...new Set(dates)];
        setBookedDates(uniqueDates);

        const userResponse = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data.user);
        setUserEmail(userResponse.data.user.email);

        const fullName = `${userResponse.data.user.first_name} ${userResponse.data.user.last_name}`;

        setCustomerDetails({
          name: fullName,
          email: userResponse.data.user.email,
          phone: userResponse.data.user.phone,
          description: "הזמנת אולם",
        });
        setDataLoaded(true);
      } catch (error) {
        console.error("שגיאה בשליפת נתונים:", error);
        message.error("שגיאה בשליפת נתונים.");
      }
    };

    fetchData();
  }, [token]);

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

  const handleCateringCheck = (e) => {
    setCatering(e.target.checked);
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

  const handlePayment = () => {
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

    fetch(`${API_URL}/eventlist/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookingFinished(true);
          setSendEmail(true);
        } else {
          message.error("שגיאה בשמירת ההזמנה");
        }
      })
      .catch((err) => {
        console.error(err);
        message.error("שגיאה בשמירת ההזמנה");
      });
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
              <Checkbox checked={catering} onChange={handleCateringCheck}>
                האם להוסיף קייטרינג?
              </Checkbox>
            </Form.Item>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                visibility: catering ? "visible" : "hidden",
              }}
            >
              <label style={{ margin: 0 }}>מספר מנות:</label>
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
  <div style="max-width: 500px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif; direction: rtl; text-align: right;">
    <h3 style="margin-top: 0; color: #333;">סיכום הזמנה</h3>
    <p><strong>אולמי בית הכנסת ${settings.synagogueName}</strong></p>
    <p>הזמנה מאת: ${user.first_name} ${user.last_name}</p>
    <p>סוג האירוע: ${eventType}</p>
    <p>בתאריך: ${selectedDate ? selectedDate.format("DD-MM-YYYY") : ""}</p>
    <p>משעה: ${startTime ? startTime : ""} עד שעה: ${endTime ? endTime : ""}</p>
    <p>מספר שעות: ${hours}</p>
    <p>טלפון: ${user.phone} | דוא"ל: ${user.email}</p>
    <p>מחיר האולם: ${hours * settings.hallPricePerHour} ₪</p>
    ${
      catering
        ? `<p>מחיר הקייטרינג: ${mealCount * settings.pricePerPerson} ₪</p>
        <p>מספר מנות: ${mealCount}</p>`
        : ""
    }
    <hr style="margin: 15px 0; border: none; border-top: 1px solid #ccc;" />
    <h4 style="margin: 5px 0; color: #000;">סה"כ לתשלום: ${totalAmount} ₪</h4>
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
            to={userEmail}
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
